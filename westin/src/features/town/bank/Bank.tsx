import React, { useState } from 'react';
import Image from 'next/image';
import { useTown } from '../components/TownContext';

const Bank: React.FC = () => {
  const { isBankOpen, setIsBankOpen, characterData, setCharacterData } = useTown();
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<{ text: string, isError: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  if (!isBankOpen || !characterData) return null;

  const handleClose = () => {
    setIsBankOpen(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleDeposit = () => {
    const depositAmount = parseInt(amount, 10);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setMessage({ text: 'Te rog introdu o sumă validă.', isError: true });
      return;
    }
    if (depositAmount > characterData.money.cash) {
      setMessage({ text: 'Nu ai suficienți yang pentru a face acest depozit.', isError: true });
      return;
    }
    setCharacterData({
      ...characterData,
      money: {
        cash: characterData.money.cash - depositAmount,
        bank: characterData.money.bank + depositAmount,
      },
    });
    setAmount('');
    setMessage({ text: `Ai depozitat cu succes ${depositAmount} yang.`, isError: false });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleWithdraw = () => {
    const withdrawAmount = parseInt(amount, 10);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setMessage({ text: 'Te rog introdu o sumă validă.', isError: true });
      return;
    }
    if (withdrawAmount > characterData.money.bank) {
      setMessage({ text: 'Nu ai suficienți yang în depozit pentru a retrage această sumă.', isError: true });
      return;
    }
    setCharacterData({
      ...characterData,
      money: {
        cash: characterData.money.cash + withdrawAmount,
        bank: characterData.money.bank - withdrawAmount,
      },
    });
    setAmount('');
    setMessage({ text: `Ai retras cu succes ${withdrawAmount} yang.`, isError: false });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'deposit') {
      handleDeposit();
    } else {
      handleWithdraw();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md sm:max-w-lg bg-metin-dark border-2 border-metin-gold/60 rounded-lg shadow-xl p-4 sm:p-6">
        <div className="absolute top-2 right-2">
          <button onClick={handleClose} className="text-gray-400 hover:text-white focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4 flex items-center justify-center">
            <Image
              src="/npc/Depozit.png"
              alt="Depozit"
              width={40}
              height={40}
              className="object-contain max-h-full"
              style={{ objectPosition: 'center center' }}
            />
          </div>
          <h2 className="text-xl sm:text-2xl text-metin-gold font-bold">Depozit</h2>
        </div>

        <div className="bg-metin-dark/90 border border-metin-gold/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="text-metin-gold font-semibold mb-2 text-sm sm:text-base">Informații Yang</h3>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div>
              <p className="text-gray-400 mb-1 text-xs sm:text-sm">Yang în inventar:</p>
              <p className="text-white font-medium text-sm sm:text-base">{characterData.money.cash.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1 text-xs sm:text-sm">Yang în depozit:</p>
              <p className="text-white font-medium text-sm sm:text-base">{characterData.money.bank.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-metin-gold/30 mb-4">
          <button
            className={`flex-1 py-2 font-medium text-sm sm:text-base ${
              activeTab === 'deposit'
                ? 'text-metin-gold border-b-2 border-metin-gold'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('deposit')}
          >
            Depozitează
          </button>
          <button
            className={`flex-1 py-2 font-medium text-sm sm:text-base ${
              activeTab === 'withdraw'
                ? 'text-metin-gold border-b-2 border-metin-gold'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('withdraw')}
          >
            Retrage
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              message.isError ? 'bg-red-900/60 border border-red-700' : 'bg-green-900/60 border border-green-700'
            }`}
          >
            <p className={`${message.isError ? 'text-red-400' : 'text-green-400'} text-xs sm:text-sm`}>
              {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-300 mb-2 text-sm sm:text-base">
              {activeTab === 'deposit' ? 'Sumă pentru depozitare:' : 'Sumă pentru retragere:'}
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              className="w-full bg-metin-dark/80 border border-metin-gold/40 rounded-md px-3 py-2 text-white focus:outline-none focus:border-metin-gold text-sm sm:text-base"
              placeholder="Introdu suma..."
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              className="flex-1 bg-metin-dark border border-metin-gold/40 hover:bg-metin-gold/20 text-metin-gold py-2 rounded transition-colors text-sm sm:text-base"
              onClick={() => {
                const maxAmount = activeTab === 'deposit' ? characterData.money.cash : characterData.money.bank;
                setAmount(maxAmount.toString());
              }}
            >
              Sumă maximă
            </button>
            <button
              type="submit"
              className="flex-1 bg-metin-gold/20 hover:bg-metin-gold/40 text-metin-gold py-2 rounded transition-colors text-sm sm:text-base"
            >
              {activeTab === 'deposit' ? 'Depozitează' : 'Retrage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Bank;