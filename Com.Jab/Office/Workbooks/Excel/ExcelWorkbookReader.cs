﻿using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Serialization;

namespace Com.Jab.Office.Workbooks.Excel
{
    internal class ExcelWorkbookReader : IDisposable
    {

        private const string workbookFileName = "xl/workbook.xml";
        private const string xmlExtension = ".xml";

        private ZipArchive m_zipArchive;
        private bool m_hasRead;
        private Workbook m_result;
        private SharedStringTableXml m_sharedStringTableXml;
        private WorkbookXml m_workbookXml;
        private RelationshipRootXml m_workbookRelsXml;

        public ExcelWorkbookReader(Stream stream)
        {
            bool ex = true;
            try
            {
                m_zipArchive = new ZipArchive(stream, ZipArchiveMode.Read, false, null);
                ex = false;
            }
            finally
            {
                if (ex)
                {
                    m_zipArchive.Dispose();
                }
            }
        }

        public void Dispose()
        {
            m_zipArchive.Dispose();
        }

        public Workbook Read()
        {
            if (m_hasRead) return m_result;
            m_result = new Workbook();
            m_sharedStringTableXml = DeserializeXmlZipArchiveEntry<SharedStringTableXml>(GetZipArchiveEntry("xl/sharedStrings.xml"));
            ValidateSharedStringTable();

            m_workbookXml = DeserializeXmlZipArchiveEntry<WorkbookXml>(GetZipArchiveEntry(workbookFileName));
            if (m_workbookXml.Sheets != null && 0 < m_workbookXml.Sheets.Length)
            {
                m_workbookRelsXml = DeserializeXmlZipArchiveEntry<RelationshipRootXml>(
                    GetZipArchiveEntry(
                        GetRelationshipsFileName(workbookFileName)));
                foreach (var wbWs in m_workbookXml.Sheets)
                {
                    if (wbWs.RelationshipId == null) throw new Exception();
                    var wbWsRel = m_workbookRelsXml.Relationships.Single(r => r.Id == wbWs.RelationshipId);
                    if (wbWsRel.Type != XmlConstants.Namespace_OfficeRelationships_Worksheet) throw new Exception();
                    string wsFileName = ResolveRelativeFileName(workbookFileName, wbWsRel.Target);
                    var wsXml = DeserializeXmlZipArchiveEntry<WorksheetXml>(GetZipArchiveEntry(wsFileName));
                    var ws = ReadWorksheet(wsFileName, wsXml);

                    ws.Name = wbWs.Name;
                    ws.Workbook = m_result;
                    m_result.WorksheetsInternal.Add(ws);
                }
            }
            
            m_hasRead = true;
            return m_result;
        }

        private static string GetRelationshipsFileName(string fileName)
        {
            if (fileName == null) throw new ArgumentNullException();
            int i1 = fileName.LastIndexOf('/');
            if (i1 < 0) throw new ArgumentException();
            return fileName.Substring(0, i1) + "/_rels/" + fileName.Substring(i1 + 1) + ".rels";
        }

        private void ValidateSharedStringTable()
        {
            List<DrawingRXml1> rXmlStack = new List<DrawingRXml1>();
            for (int i = 0; i < m_sharedStringTableXml.si.Length; i++)
            {
                var si = m_sharedStringTableXml.si[i];
                if ((si.r != null) == (si.t != null))
                {
                    throw new NotImplementedException();
                }
                if (si.r != null)
                {
                    rXmlStack.AddRange(si.r);
                }
            }
            while (0 < rXmlStack.Count)
            {
                var r = rXmlStack[rXmlStack.Count - 1];
                rXmlStack.RemoveAt(rXmlStack.Count - 1);
                if ((r.r != null) == (r.t != null)
                    || !(r.rPr == null || r.t != null))
                {
                    throw new NotImplementedException();
                }
                if (r.r != null)
                {
                    rXmlStack.AddRange(r.r);
                }
            }
        }
        
        private Worksheet ReadWorksheet(string wsFileName, WorksheetXml wsXml)
        {
            var ws = new Worksheet();
            for (int i = 0; i < wsXml.Rows.Length; i++)
            {
                var row = ReadRow(wsXml.Rows[i]);
                ws.RowsInternal.Add(row);
                row.Worksheet = ws;
            }
            bool hasRels = wsXml.Drawings != null && wsXml.Drawings.Any(d => d.id != null);
            if (hasRels)
            {
                var wsRelsFileName = GetRelationshipsFileName(wsFileName);
                var wsRelsXml = DeserializeXmlZipArchiveEntry<RelationshipRootXml>(GetZipArchiveEntry(wsRelsFileName));
                foreach (var drawingRelId in wsXml.Drawings.Select(d => d.id))
                {
                    var drawingRel = wsRelsXml.Relationships.Single(r => r.Id == drawingRelId);
                    if (drawingRel.Type != XmlConstants.Namespace_OfficeRelationships_Drawing)
                    {
                        throw new NotImplementedException();
                    }
                    var drawingFileName = ResolveRelativeFileName(wsFileName, drawingRel.Target);
                    var drawingXml = DeserializeXmlZipArchiveEntry<DrawingXml>(GetZipArchiveEntry(drawingFileName));
                    var drawing = ReadDrawing(drawingXml);
                    drawing.Worksheet = ws;
                    ws.DrawingsInternal.Add(drawing);
                }
            }
            return ws;
        }

        private Drawing ReadDrawing(DrawingXml drawingXml)
        {
            if (drawingXml.TwoCellAnchor == null)
            {
                throw new NotImplementedException();
            }
            var spdr = drawingXml.TwoCellAnchor.sp;
            if (spdr == null)
            {
                throw new NotImplementedException();
            }
            Drawing drawing = null;
            if (spdr.txBody != null)
            {
                drawing = new TextDrawing();
                ReadTextDrawing((TextDrawing)drawing, spdr.txBody);
            }
            if (drawing == null)
            {
                throw new NotImplementedException();
            }
            return drawing;
        }

        private void ReadTextDrawing(TextDrawing txDr, DrawingSpTxBodyXml txBody)
        {
            for (int i = 0; i < txBody.p.Length; i++)
            {
                var p = txBody.p[i];
                var paragraph = new Paragraph();
                if (p.r != null)
                {
                    paragraph.Text_Unformatted = string.Concat(p.r.Select(r => r.t));
                }
                txDr.ParagraphsInternal.Add(paragraph);
            }
        }
        
        private static bool StartsWith_Ordinal(string s1, int s1Offset, string s2)
        {
            return s1.LastIndexOf(s2, s1Offset + s2.Length - 1, s2.Length, StringComparison.Ordinal) == s1Offset;
        }

        private static string ResolveRelativeFileName(string baseFileName, string relFileName)
        {
            int baseFileNameLen = baseFileName.Length;
            var i = baseFileName.LastIndexOf('/', baseFileNameLen - 1);
            if (i < 0) throw new ArgumentException();
            baseFileNameLen = i; // get directory name

            int relFileNameStart = 0;
            if (StartsWith_Ordinal(relFileName, relFileNameStart, "../"))
            {
                do
                {
                    i = baseFileName.LastIndexOf('/', baseFileNameLen - 1);
                    if (i < 0) throw new ArgumentException();
                    baseFileNameLen = i;
                    relFileNameStart += 3;
                } while (StartsWith_Ordinal(relFileName, relFileNameStart, "../"));
                return baseFileName.Substring(0, baseFileNameLen) + relFileName.Substring(relFileNameStart - 1);
            }
            return baseFileName.Substring(0, baseFileNameLen) + '/' + relFileName;
        }

        private Row ReadRow(RowXml rowXml)
        {
            var row = new Row();
            if (rowXml.c.Length == 0) throw new NotImplementedException();
            var cell = ReadCell(rowXml.c[0]);
            int rowIndex_oneBased;
            int columnIndex;
            ParseCellReference(rowXml.c[0].r, out columnIndex, out rowIndex_oneBased);
            row.RowIndex = rowIndex_oneBased - 1;
            cell.ColumnIndex = columnIndex;
            cell.Row = row;
            row.CellsInternal_NonEmpty.Add(cell);
            for (int i = 1; i < rowXml.c.Length; i++)
            {
                cell = ReadCell(rowXml.c[i]);
                ParseCellReference(rowXml.c[i].r, out columnIndex, out rowIndex_oneBased);
                if (rowIndex_oneBased - 1 != row.RowIndex) throw new NotImplementedException();
                cell.ColumnIndex = columnIndex; 
                row.CellsInternal_NonEmpty.Add(cell);
                cell.Row = row;
            }
            return row;
        }

        private Cell ReadCell(CellXml cellXml)
        {
            Cell cell = new Cell();
            cell.ValueUnformatted = cellXml.v;
            if (cellXml.t != null)
            {
                switch (cellXml.t)
                {
                    case "s":
                        var e = m_sharedStringTableXml.si[int.Parse(cellXml.v, NumberStyles.None, NumberFormatInfo.InvariantInfo)];
                        cell.ValueUnformatted = GetUnformattedValue(e);
                        break;
                    case "str":
                        break;
                    default:
                        throw new NotImplementedException();
                }
            }
            return cell;
        }

        private static string GetUnformattedValue(SharedStringXml e)
        {
            if (e.t != null) return e.t;
            List<DrawingRXml1> rXmlStack = new List<DrawingRXml1>();
            AddRangeReversed(rXmlStack, e.r);
            if (0 == rXmlStack.Count) throw new NotImplementedException();
            StringBuilder sb = new StringBuilder();
            while (0 < rXmlStack.Count)
            {
                var rXml = rXmlStack[rXmlStack.Count - 1];
                rXmlStack.RemoveAt(rXmlStack.Count - 1);
                if (rXml.t != null)
                {
                    sb.Append(rXml.t);
                }
                else
                {
                    AddRangeReversed(rXmlStack, rXml.r);
                }
            }
            return sb.ToString();
        }

        private static void AddRangeReversed<T>(ICollection<T> dst, IReadOnlyList<T> src)
        {
            int i = src.Count;
            while (-1 < --i)
            {
                dst.Add(src[i]);
            }
        }

        private ZipArchiveEntry GetZipArchiveEntry(string fileName)
        {
            return m_zipArchive.Entries.SingleOrDefault(n => n.FullName.Equals(fileName));
        }
        
        private static T DeserializeXmlZipArchiveEntry<T>(ZipArchiveEntry entry)
        {
            using (Stream stream = entry.Open())
            using (var xmlReader = XmlReader.Create(stream))
            {
                return (T)new XmlSerializer(typeof(T)).Deserialize(xmlReader);
            }
        }

        private static int IndexInAlphabet(char ch)
        {
            if ('A' <= ch && ch <= 'Z')
            {
                return ch - 'A';
            }
            if ('a' <= ch && ch <= 'z')
            {
                return ch - 'a';
            }
            return -1;
        }

        private static int GetAsciiDigitValue(char ch)
        {
            int i = ch - '0';
            if (i < 10) return i;
            return -1;
        }
        
        private static void ParseCellReference(string s, out int columnIndex, out int rowIndex_oneBased)
        {
            int sLen, t;
            if (s == null) throw new ArgumentNullException();
            if ((sLen = s.Length) == 0) throw new ArgumentException();
            columnIndex = IndexInAlphabet(s[0]);
            if (columnIndex < 0) throw new ArgumentException();
            int i = 1;
            while (i < sLen)
            {
                t = IndexInAlphabet(s[i]);
                if (t < 0) goto parseRowIndex;
                columnIndex = unchecked(columnIndex * 26 + t);
                if (++i == 6)
                {
                    if (i == sLen) throw new ArgumentException();
                    break;
                }
            }
            t = IndexInAlphabet(s[i]);
            if (0 <= t)
            {
                if (i + 1 < sLen && 0 <= IndexInAlphabet(s[i + 1])) throw new ArgumentException();
                try
                {
                    columnIndex = checked(columnIndex * 26 + t);
                }
                catch (OverflowException)
                {
                    throw new ArgumentException();
                }
                i += 1;
            }
        parseRowIndex:
            rowIndex_oneBased = int.Parse(s.Substring(i),
                NumberStyles.None,
                NumberFormatInfo.InvariantInfo);
        }
        
    }
}
