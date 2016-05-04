using PersistentDictionary.Transactions;
using System.Transactions;
using Com.Jab.LibCore;
using Com.Jab.LibWinInterop.IO;
using Com.Jab.LibWinInterop.Transactions;

namespace Com.Jab.LibEnterprise.Acid
{
    public class FileBuddyAllocator64Transactional : IAllocator
    {
        private class TransactionInfo : IEnlistmentNotification
        {
            internal UInt128 TransactionId;
            internal bool IsValid;
            internal FileBuddyAllocator64Transactional Owner;

            public TransactionInfo()
            {
            }

            public void Commit(Enlistment enlistment)
            {
                SetDone(enlistment);
            }

            public void InDoubt(Enlistment enlistment)
            {
                SetDone(enlistment);
            }

            public void Prepare(PreparingEnlistment preparingEnlistment)
            {

                if (IsValid)
                {
                    Owner.FlushManagedCodeFileBuffers();
                }
                preparingEnlistment.Prepared();
            }

            public void Rollback(Enlistment enlistment)
            {
                SetDone(enlistment);
            }

            private void SetDone(Enlistment enlistment)
            {
                enlistment.Done();
            }
        }

        private FileBuddyAllocator64 m_inner;
        private string m_finalPathName; 
        private TransactionInfo m_lastTransactionInfo;
        private bool m_lastTransactionInfo_isNotValid;

        private FileBuddyAllocator64Transactional()
        {
        }

        internal RandomAccessFileHandle64 RandAccFH
        {
            get
            {
                return m_inner.RandAccFH;
            }
        }

        public ulong MaxObjectSize
        {
            get
            {
                return m_inner.MaxObjectSize;
            }
        }

        public ulong Allocate(ulong size)
        {
            EnsureTransactionalFileHandle(Transaction.Current);
            var byteOff_block = m_inner.Allocate(size);
            return byteOff_block;
        }

        public void Dispose()
        {
            FileHandle fh = null;
            try
            {
                if (m_lastTransactionInfo_isNotValid)
                {
                    fh = m_inner.RandAccFH.Handle;
                    m_inner.RandAccFH.Handle = FileHandle.Null;
                }
                m_inner.Dispose();
            }
            finally
            {
                if (m_lastTransactionInfo_isNotValid)
                {
                    m_inner.RandAccFH.Handle = fh;
                }
            }
        }

        private void EnsureTransactionalFileHandle(Transaction transaction)
        {
            TransactionInfo transactionInfo;
            UInt128 transactionId;
            if (transaction != null)
            {
                transactionId = new UInt128();
                using (var hKernelTransaction = transaction.GetKernelTransaction())
                {
                    TransactionUtil.GetId(hKernelTransaction, transactionId);
                }
                if (m_lastTransactionInfo != null && transactionId.Equals(m_lastTransactionInfo.TransactionId)) return;
            }
            else
            {
                if (m_lastTransactionInfo == null  && !m_lastTransactionInfo_isNotValid) return;
                transactionId = null;
            }
            transactionInfo = null;
            FlushManagedCodeFileBuffers();
            if (m_lastTransactionInfo != null)
            {
                m_lastTransactionInfo.IsValid = false;
                m_lastTransactionInfo = null;
            }
            if (transaction != null)
            {
                transactionInfo = new TransactionInfo();
                transactionInfo.TransactionId = transactionId;
                transactionInfo.Owner = this;
            }
            if (m_inner.RandAccFH.Handle != null)
            {
                m_inner.RandAccFH.Handle.Dispose();
                m_inner.RandAccFH.Handle = null;
            }
            if (transaction != null)
            {
                transaction.EnlistVolatile(transactionInfo, EnlistmentOptions.None);
                m_inner.RandAccFH.Handle = FileHandle.NewTx(
                    m_finalPathName,
                    dwCreationDisposition: FileCreationDisposition.OpenExisting,
                    dwFlagsAndAttributes: FileFlagsAndAttributes.Flag_RandomAccess,
                    transaction: transaction);
                transactionInfo.IsValid = true;
                m_lastTransactionInfo = transactionInfo;
            }
            else
            {
                m_inner.RandAccFH.Handle = FileHandle.New(
                    m_finalPathName,
                    dwCreationDisposition: FileCreationDisposition.OpenExisting,
                    dwFlagsAndAttributes: FileFlagsAndAttributes.Flag_RandomAccess);
            }
            m_lastTransactionInfo_isNotValid = false;
        }
        
        private void FlushManagedCodeFileBuffers()
        {
            if (m_inner.RandAccFH.Handle != null)
            {
                m_inner.RandAccFH.Flush();
            }
        }

        public void Free(ulong address)
        {
            EnsureTransactionalFileHandle(Transaction.Current);
            m_inner.Free(address);
        }

        public static FileBuddyAllocator64Transactional OpenOrCreate(string fileName, long byteSizeOf_order0 = 16, int maxOrder = int.MaxValue)
        {
            FileBuddyAllocator64 inner = null;
            bool ex = true;
            try
            {
                inner = FileBuddyAllocator64.OpenOrCreate(fileName, byteSizeOf_order0, maxOrder);
                var instance = new FileBuddyAllocator64Transactional();
                instance.m_inner = inner;
                instance.m_finalPathName = inner.RandAccFH.Handle.GetFinalPathName();
                ex = false;
                return instance;
            }
            finally
            {
                if (ex && inner != null)
                {
                    inner.Dispose();
                }
            }
        }
    }
}
