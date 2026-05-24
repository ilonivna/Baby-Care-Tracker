import React, { useRef } from "react";
import { Camera, Calendar, Sparkles, Heart } from "lucide-react";

interface BabyInfoBannerProps {
  babyName: string;
  onChangeName: (name: string) => void;
  birthDate: string;
  onChangeBirthDate: (date: string) => void;
  babyPhoto: string | null;
  onChangePhoto: (photo: string | null) => void;
}

export default function BabyInfoBanner({
  babyName,
  onChangeName,
  birthDate,
  onChangeBirthDate,
  babyPhoto,
  onChangePhoto
}: BabyInfoBannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computes age in exact months and days
  const calculateAge = (dateStr: string) => {
    if (!dateStr) return { months: 0, days: 0, totalDays: 0 };
    const birth = new Date(dateStr);
    const now = new Date();
    
    // Total days difference
    const diffTime = Math.max(0, now.getTime() - birth.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      // Borrow days from previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }

    if (months < 0) {
      months += 12;
      years--;
    }

    const totalMonths = Math.max(0, years * 12 + months);

    return {
      months: totalMonths,
      days: Math.max(0, days),
      totalDays
    };
  };

  const { months, days, totalDays } = calculateAge(birthDate);

  // Handler for image thumbnail generation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Export highly-compressed JPEG to fit comfortably in localStorage
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        onChangePhoto(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Would you like to clear the baby's photo?")) {
      onChangePhoto(null);
    }
  };

  return (
    <div 
      className="bg-white rounded-3xl border border-[#F0EBE3] shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center gap-6"
      id="baby-info-banner-panel"
    >
      {/* Hidden file uploader input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePhotoUpload} 
        accept="image/*" 
        className="hidden" 
        id="baby-avatar-file-input"
      />

      {/* Avatar Image Circle Container */}
      <div className="relative shrink-0">
        <div 
          onClick={triggerFileSelector}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#F2EDE4] bg-[#FAF7F2] hover:border-[#7E8C78]/25 cursor-pointer overflow-hidden transition-all duration-300 relative group flex items-center justify-center shadow-xs"
          title="Click to upload baby photo"
        >
          {babyPhoto ? (
            <>
              <img 
                src={babyPhoto} 
                alt="Baby profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] sm:text-xs">
                <Camera size={14} className="mb-0.5 sm:mb-1" />
                <span>Change</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-[#A69E94] group-hover:text-[#7E8C78] transition-colors p-3 text-center">
              <span className="text-3xl mb-1">👶🏼</span>
              <div className="flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-widest">
                <Camera size={10} />
                <span>Add Photo</span>
              </div>
            </div>
          )}
        </div>

        {/* Quiet photo clear button, only visible if photo is loaded */}
        {babyPhoto && (
          <button
            onClick={handleRemovePhoto}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-white hover:bg-red-50 text-[#A69E94] hover:text-red-500 rounded-full border border-[#E9E1D6] flex items-center justify-center shadow-sm cursor-pointer transition-colors text-[10px]"
            title="Remove photo"
          >
            ✕
          </button>
        )}
      </div>

      {/* Profile Details & Inputs Panel */}
      <div className="flex-1 w-full text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2.5">
              <span className="text-xs uppercase font-mono tracking-widest text-[#A69E94] font-bold">Personalizing:</span>
              <div className="relative inline-block w-full md:w-fit">
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => onChangeName(e.target.value || "Baby")}
                  className="bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] focus:bg-white border-b-2 border-[#E9E1D6] focus:border-[#7E8C78] text-xl font-serif italic text-[#4A443F] font-bold px-2 py-0.5 outline-hidden transition-all text-center md:text-left rounded-t-lg max-w-[200px]"
                  placeholder="Baby's Name"
                  title="Rename Baby"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-1 justify-center md:justify-start">
              {/* Dynamic Birthday Picker */}
              <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E9E1D6] rounded-full px-3.5 py-1.5 text-xs text-[#4A443F]">
                <Calendar size={13} className="text-[#A69E94]" />
                <span className="font-sans font-semibold text-[#A69E94] shrink-0">Birth Date:</span>
                <input
                  type="date"
                  value={birthDate}
                  max={new Date().toISOString().substring(0, 10)}
                  onChange={(e) => onChangeBirthDate(e.target.value)}
                  className="bg-transparent text-xs text-[#4A443F] font-mono font-bold outline-hidden cursor-pointer"
                  title="Select Baby's Birth Date"
                />
              </div>

              {/* Total Days of Life counter badge */}
              {totalDays > 0 && (
                <div className="bg-[#FAF7F2] border border-[#E9E1D6]/80 text-[#D4A373] text-[11px] font-sans font-bold rounded-full px-3 py-1 flex items-center gap-1">
                  <Heart size={11} className="fill-[#D4A373]" />
                  <span>{totalDays} Days of Wonder</span>
                </div>
              )}
            </div>
            
            {/* Computed Age output indicator */}
            <div className="mt-3.5 pt-3.5 border-t border-[#F2EDE4] flex justify-center md:justify-start">
              <span className="font-serif italic text-base sm:text-lg text-[#5C6658] flex items-center gap-2 justify-center leading-normal">
                <Sparkles size={16} className="text-[#D4A373] shrink-0 animate-pulse" />
                <span>
                  {babyName} is exactly <b className="text-[#7E8C78] font-bold not-italic font-mono text-lg">{months}</b> {months === 1 ? "month" : "months"} and <b className="text-[#7E8C78] font-bold not-italic font-mono text-lg">{days}</b> {days === 1 ? "day" : "days"} old today!
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
