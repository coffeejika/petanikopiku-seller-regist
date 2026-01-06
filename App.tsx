
import React, { useState, useEffect } from 'react';
import { CoffeeIcon, UserIcon, ShieldIcon, CheckIcon, BotIcon } from './components/Icons';
import { RegistrationData, Step } from './types';
import { getSellerAssistance, generateProfessionalSummary } from './services/geminiService';

const ADMIN_WA_NUMBER = "+6287725071919";

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [data, setData] = useState<RegistrationData>({
    profile: { fullName: '', phone: '', email: '', address: '', province: '', regency: '' },
    store: { storeName: '', storeAddress: '', annualSales: '' },
    verification: { ktpNumber: '', ktpPhoto: null, ktpPhotoPreview: null }
  });

  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const checkConfig = () => {
      try {
        const key = process?.env?.API_KEY;
        if (!key || key === "") {
          setHasApiKey(false);
        }
      } catch (e) {
        setHasApiKey(false);
      }
    };
    checkConfig();
  }, []);

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'Profil', icon: <UserIcon className="w-5 h-5" /> },
    { key: 'store', label: 'Toko', icon: <CoffeeIcon className="w-5 h-5" /> },
    { key: 'verification', label: 'Keamanan', icon: <ShieldIcon className="w-5 h-5" /> },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ 
          ...prev, 
          verification: { ...prev.verification, ktpPhoto: file, ktpPhotoPreview: reader.result as string } 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const askAI = async () => {
    if (!hasApiKey) {
      setAiResponse("Fitur AI dinonaktifkan. Silakan isi form secara manual.");
      return;
    }
    setIsAiLoading(true);
    const context = `Langkah: ${currentStep}. Data: ${JSON.stringify(data[currentStep === 'summary' ? 'profile' : (currentStep as keyof RegistrationData)])}`;
    const res = await getSellerAssistance("Bantu saya mengisi bagian ini.", context);
    setAiResponse(res);
    setIsAiLoading(false);
  };

  const submitToWhatsApp = async () => {
    setIsSubmitting(true);
    const summary = await generateProfessionalSummary(data);
    const message = summary || `*Pendaftaran Mitra Petanikopiku*\n\nNama: ${data.profile.fullName}\nToko: ${data.store.storeName}\nNIK: ${data.verification.ktpNumber}`;
    window.open(`https://wa.me/${ADMIN_WA_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-[#fdfbf7]">
      <div className="w-full max-w-2xl mb-8 text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="p-2 bg-emerald-800 rounded-lg text-white">
            <CoffeeIcon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-900">Petanikopiku</h1>
        </div>
        {!hasApiKey && (
          <div className="inline-block bg-amber-50 border border-amber-200 text-amber-700 text-[10px] px-3 py-1 rounded-full">
            ⚠️ AI Mode Off
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl mb-8 flex justify-between px-4">
        {steps.map((s, idx) => {
          const active = currentStep === s.key;
          const done = steps.findIndex(st => st.key === currentStep) > idx || currentStep === 'summary';
          return (
            <div key={s.key} className="flex flex-col items-center flex-1 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${
                active ? 'bg-emerald-700 text-white' : done ? 'bg-green-500 text-white' : 'bg-white border-2 border-emerald-100 text-emerald-200'
              }`}>
                {done ? <CheckIcon className="w-5 h-5" /> : s.icon}
              </div>
              <span className={`text-[9px] mt-2 font-bold uppercase ${active ? 'text-emerald-800' : 'text-emerald-300'}`}>{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 border border-emerald-50">
        {currentStep === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-emerald-900">Profil Penjual</h2>
            <input 
              className="w-full p-3 rounded-xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500" 
              placeholder="Nama Lengkap" 
              value={data.profile.fullName}
              onChange={e => setData({...data, profile: {...data.profile, fullName: e.target.value}})}
            />
            <input 
              className="w-full p-3 rounded-xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500" 
              placeholder="WhatsApp (628...)" 
              value={data.profile.phone}
              onChange={e => setData({...data, profile: {...data.profile, phone: e.target.value}})}
            />
            <textarea 
              className="w-full p-3 rounded-xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500 h-24" 
              placeholder="Alamat Lengkap"
              value={data.profile.address}
              onChange={e => setData({...data, profile: {...data.profile, address: e.target.value}})}
            />
          </div>
        )}

        {currentStep === 'store' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-emerald-900">Rincian Toko</h2>
            <input 
              className="w-full p-3 rounded-xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500" 
              placeholder="Nama Toko" 
              value={data.store.storeName}
              onChange={e => setData({...data, store: {...data.store, storeName: e.target.value}})}
            />
            <input 
              className="w-full p-3 rounded-xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500" 
              placeholder="Estimasi Produksi (kg/tahun)" 
              type="number"
              value={data.store.annualSales}
              onChange={e => setData({...data, store: {...data.store, annualSales: e.target.value}})}
            />
          </div>
        )}

        {currentStep === 'verification' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-emerald-900">Keamanan</h2>
            <input 
              className="w-full p-3 rounded-xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500" 
              placeholder="NIK KTP (16 Digit)" 
              maxLength={16}
              value={data.verification.ktpNumber}
              onChange={e => setData({...data, verification: {...data.verification, ktpNumber: e.target.value}})}
            />
            <div className="border-2 border-dashed border-emerald-100 rounded-2xl p-8 text-center bg-emerald-50/30 relative">
              {data.verification.ktpPhotoPreview ? (
                <img src={data.verification.ktpPhotoPreview} className="max-h-40 mx-auto rounded-lg" alt="Preview" />
              ) : (
                <div className="text-emerald-400">Klik untuk Unggah Foto KTP</div>
              )}
              <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
        )}

        {currentStep === 'summary' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-emerald-900">Siap Bergabung!</h2>
            <p className="text-sm text-emerald-600">Klik tombol di bawah untuk verifikasi WhatsApp.</p>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {currentStep !== 'profile' && (
            <button onClick={() => {
              if (currentStep === 'store') setCurrentStep('profile');
              if (currentStep === 'verification') setCurrentStep('store');
              if (currentStep === 'summary') setCurrentStep('verification');
            }} className="px-6 py-3 rounded-xl font-bold text-emerald-700 border border-emerald-100">Kembali</button>
          )}
          <button onClick={() => {
            if (currentStep === 'profile') setCurrentStep('store');
            else if (currentStep === 'store') setCurrentStep('verification');
            else if (currentStep === 'verification') setCurrentStep('summary');
            else submitToWhatsApp();
          }} className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-emerald-800 hover:bg-emerald-900">
            {currentStep === 'summary' ? (isSubmitting ? 'Mengirim...' : 'Kirim WhatsApp') : 'Lanjutkan'}
          </button>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">
        {aiResponse && (
          <div className="bg-white p-4 rounded-2xl shadow-2xl border border-emerald-50 max-w-[260px] text-xs">
            <button onClick={() => setAiResponse('')} className="float-right text-emerald-300 ml-2">✕</button>
            <p className="font-bold text-emerald-800 mb-1">🤖 Asisten:</p>
            {aiResponse}
          </div>
        )}
        <button 
          onClick={askAI}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${hasApiKey ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-300'}`}
        >
          {isAiLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <BotIcon className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default App;
