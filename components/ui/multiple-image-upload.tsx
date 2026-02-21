"use client"

import { useState, useRef } from "react";
import { Button } from "./button";
import { PlusIcon, EditIcon, DeleteIcon, RoundCloseIcon, ChevronLeftIcon, ChevronRightIcon } from "../AppIcon";
import { motion, AnimatePresence } from "framer-motion";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface MultipleImageUploadProps {
  frontImages?: File[];
  rearImages?: File[];
  otherImages?: File[];
  onFrontImagesChange: (files: File[]) => void;
  onRearImagesChange: (files: File[]) => void;
  onOtherImagesChange: (files: File[]) => void;
  frontError?: string;
  rearError?: string;
  otherError?: string;
  className?: string;
  maxOtherImages?: number;
  maxSize?: number; // in MB
  accept?: string;
}

export function MultipleImageUpload({
  frontImages = [],
  rearImages = [],
  otherImages = [],
  onFrontImagesChange,
  onRearImagesChange,
  onOtherImagesChange,
  frontError,
  rearError,
  otherError,
  className = "",
  maxOtherImages = 15,
  maxSize = 5,
  accept = "image/*"
}: MultipleImageUploadProps) {
  const [frontImagesState, setFrontImagesState] = useState<ImageFile[]>(() =>
    frontImages.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }))
  );

  const [rearImagesState, setRearImagesState] = useState<ImageFile[]>(() =>
    rearImages.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }))
  );

  const [otherImagesState, setOtherImagesState] = useState<ImageFile[]>(() =>
    otherImages.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }))
  );

  const [selectedOtherImageIndex, setSelectedOtherImageIndex] = useState(0);

  const [isDraggingFront, setIsDraggingFront] = useState(false);
  const [isDraggingRear, setIsDraggingRear] = useState(false);
  const [isDraggingOther, setIsDraggingOther] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const rearInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  // Front Image Handlers
  const handleDragOverFront = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFront(true);
  };

  const handleDragLeaveFront = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFront(false);
  };

  const handleDropFront = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFront(false);

    const files = Array.from(e.dataTransfer.files);
    handleFrontFiles(files);
  };

  const handleFrontFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFrontFiles(files);
  };

  const handleFrontFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 1) {
      alert('You can only upload one front image');
      return;
    }

    const validFiles = imageFiles.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Max size is ${maxSize}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newImages: ImageFile[] = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }));

      setFrontImagesState(newImages);
      onFrontImagesChange(newImages.map(img => img.file));
    }
  };

  const handleClickFront = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    frontInputRef.current?.click();
  };

  const handleRemoveFrontImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setFrontImagesState([]);
    onFrontImagesChange([]);
    if (frontInputRef.current) {
      frontInputRef.current.value = '';
    }
  };

  // Rear Image Handlers
  const handleDragOverRear = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingRear(true);
  };

  const handleDragLeaveRear = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingRear(false);
  };

  const handleDropRear = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingRear(false);

    const files = Array.from(e.dataTransfer.files);
    handleRearFiles(files);
  };

  const handleRearFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleRearFiles(files);
  };

  const handleRearFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 1) {
      alert('You can only upload one rear image');
      return;
    }

    const validFiles = imageFiles.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Max size is ${maxSize}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newImages: ImageFile[] = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }));

      setRearImagesState(newImages);
      onRearImagesChange(newImages.map(img => img.file));
    }
  };

  const handleClickRear = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    rearInputRef.current?.click();
  };

  const handleRemoveRearImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setRearImagesState([]);
    onRearImagesChange([]);
    if (rearInputRef.current) {
      rearInputRef.current.value = '';
    }
  };

  // Other Images Handlers
  const handleDragOverOther = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOther(true);
  };

  const handleDragLeaveOther = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOther(false);
  };

  const handleDropOther = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOther(false);

    const files = Array.from(e.dataTransfer.files);
    handleOtherFiles(files);
  };

  const handleOtherFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleOtherFiles(files);
  };

  const handleOtherFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    // Smart distribution: Fill empty boxes in order (Front -> Rear -> Other)
    const availableSlots = [];

    // Check Front slot
    if (frontImagesState.length === 0 && imageFiles.length > 0) {
      availableSlots.push({ type: 'front', file: imageFiles[0] });
      imageFiles.splice(0, 1);
    }

    // Check Rear slot
    if (rearImagesState.length === 0 && imageFiles.length > 0) {
      availableSlots.push({ type: 'rear', file: imageFiles[0] });
      imageFiles.splice(0, 1);
    }

    // Remaining files go to Other Images
    if (imageFiles.length > 0) {
      if (otherImagesState.length + imageFiles.length > maxOtherImages) {
        alert(`You can only upload up to ${maxOtherImages} other images`);
        return;
      }

      const validFiles = imageFiles.filter(file => {
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Max size is ${maxSize}MB`);
          return false;
        }
        return true;
      });

      const newImages: ImageFile[] = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }));

      const updatedImages = [...otherImagesState, ...newImages];
      setOtherImagesState(updatedImages);
      onOtherImagesChange(updatedImages.map(img => img.file));
    }

    // Process Front and Rear assignments
    availableSlots.forEach(slot => {
      if (slot.file.size > maxSize * 1024 * 1024) {
        alert(`File "${slot.file.name}" is too large. Max size is ${maxSize}MB`);
        return;
      }

      const newImage: ImageFile = {
        id: Math.random().toString(36).substr(2, 9),
        file: slot.file,
        preview: URL.createObjectURL(slot.file)
      };

      if (slot.type === 'front') {
        setFrontImagesState([newImage]);
        onFrontImagesChange([newImage.file]);
      } else if (slot.type === 'rear') {
        setRearImagesState([newImage]);
        onRearImagesChange([newImage.file]);
      }
    });
  };

  const handleClickOther = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    otherInputRef.current?.click();
  };

  const clearOtherImages = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setOtherImagesState([]);
    onOtherImagesChange([]);
    setSelectedOtherImageIndex(0);
    if (otherInputRef.current) {
      otherInputRef.current.value = '';
    }
  };

  const handleRemoveOtherImage = (id: string, index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const updatedImages = otherImagesState.filter(img => img.id !== id);
    setOtherImagesState(updatedImages);
    onOtherImagesChange(updatedImages.map(img => img.file));

    if (index <= selectedOtherImageIndex) {
      setSelectedOtherImageIndex(Math.max(0, selectedOtherImageIndex - 1));
    }
  };

  const handleReorderOther = (fromIndex: number, toIndex: number) => {
    const reorderedImages = [...otherImagesState];
    const [movedImage] = reorderedImages.splice(fromIndex, 1);
    reorderedImages.splice(toIndex, 0, movedImage);

    setOtherImagesState(reorderedImages);
    onOtherImagesChange(reorderedImages.map(img => img.file));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Media</h3>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Column: Front and Rear stacked */}
        <div className="space-y-4">
          {/* Front View Box */}
          <div className="space-y-2">
            {frontImagesState.length === 0 ? (
              <div
                className={`w-full border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer bg-white ${isDraggingFront
                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                onDragOver={handleDragOverFront}
                onDragLeave={handleDragLeaveFront}
                onDrop={handleDropFront}
                onClick={handleClickFront}
              >
                <div className="flex flex-col items-center space-y-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">Upload Front Image</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <img
                  src={frontImagesState[0].preview}
                  alt="Front view preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute border-2 border-gray-200 inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleClickFront}
                    className="h-8 w-8 p-0"
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleRemoveFrontImage}
                    className="h-8 w-8 p-0"
                  >
                    <DeleteIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {frontError && (
              <p className="text-xs text-red-500 mt-1">{frontError}</p>
            )}
            <input
              ref={frontInputRef}
              type="file"
              accept={accept}
              onChange={handleFrontFileSelect}
              className="hidden"
            />
          </div>

          {/* Rear View Box */}
          <div className="space-y-2">
            {rearImagesState.length === 0 ? (
              <div
                className={`w-full border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer bg-white ${isDraggingRear
                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                onDragOver={handleDragOverRear}
                onDragLeave={handleDragLeaveRear}
                onDrop={handleDropRear}
                onClick={handleClickRear}
              >
                <div className="flex flex-col items-center space-y-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">Upload Rear Image</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <img
                  src={rearImagesState[0].preview}
                  alt="Rear view preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleClickRear}
                    className="h-8 w-8 p-0"
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleRemoveRearImage}
                    className="h-8 w-8 p-0"
                  >
                    <DeleteIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            {rearError && (
              <p className="text-xs text-red-500 mt-1">{rearError}</p>
            )}
            <input
              ref={rearInputRef}
              type="file"
              accept={accept}
              onChange={handleRearFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Second Column: Other Images */}
        <div className="space-y-4">
          {otherImagesState.length === 0 ? (
            <div
              className={`w-full h-full min-h-[272px] border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer bg-white ${isDraggingOther
                  ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                }`}
              onDragOver={handleDragOverOther}
              onDragLeave={handleDragLeaveOther}
              onDrop={handleDropOther}
              onClick={handleClickOther}
            >
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200">
                  <PlusIcon className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Drag & Drop Images</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto text-center">
                  You can add up to {maxOtherImages} images.
                </p>
              </div>
            </div>
          ) : (
            <div className="border-2 border-gray-200 rounded-xl">
              {/* Main Preview Slider */}
              <div className="relative p-2 group aspect-video md:aspect-auto md:h-54 overflow-hidden cursor-grab active:cursor-grabbing">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={otherImagesState[selectedOtherImageIndex]?.id || 'empty'}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      const swipeThreshold = 50;
                      if (info.offset.x < -swipeThreshold) {
                        // Swipe left -> Next image
                        if (selectedOtherImageIndex < otherImagesState.length - 1) {
                          setSelectedOtherImageIndex(selectedOtherImageIndex + 1);
                        }
                      } else if (info.offset.x > swipeThreshold) {
                        // Swipe right -> Previous image
                        if (selectedOtherImageIndex > 0) {
                          setSelectedOtherImageIndex(selectedOtherImageIndex - 1);
                        }
                      }
                    }}
                  >
                    <img
                      src={otherImagesState[selectedOtherImageIndex]?.preview || otherImagesState[0].preview}
                      alt="Other images preview"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {otherImagesState.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedOtherImageIndex > 0) {
                          setSelectedOtherImageIndex(selectedOtherImageIndex - 1);
                        }
                      }}
                      disabled={selectedOtherImageIndex === 0}
                      className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center transition-all ${
                        selectedOtherImageIndex === 0 
                          ? "opacity-0 pointer-events-none" 
                          : "hover:bg-white hover:scale-110 shadow-sm"
                      }`}
                    >
                      <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedOtherImageIndex < otherImagesState.length - 1) {
                          setSelectedOtherImageIndex(selectedOtherImageIndex + 1);
                        }
                      }}
                      disabled={selectedOtherImageIndex === otherImagesState.length - 1}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center transition-all ${
                        selectedOtherImageIndex === otherImagesState.length - 1 
                          ? "opacity-0 pointer-events-none" 
                          : "hover:bg-white hover:scale-110 shadow-sm"
                      }`}
                    >
                      <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Navigation Indicators (Dots) */}
                {otherImagesState.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {otherImagesState.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === selectedOtherImageIndex 
                            ? "w-4 bg-blue-500" 
                            : "w-1.5 bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 4-Box Gallery */}
              <div className="grid grid-cols-4 gap-1 border-t-2 border-gray-200 p-1">
                {otherImagesState.slice(0, 3).map((image, index) => {
                  const hasMore = index === 2 && otherImagesState.length > 3;
                  const remainingCount = otherImagesState.length - 3;

                  return (
                    <div
                      key={image.id}
                      onClick={() => setSelectedOtherImageIndex(index)}
                      className={`relative h-10 w-10 rounded-lg border transition-all cursor-pointer ${selectedOtherImageIndex === index
                        ? "ring-1 ring-blue-500"
                        : 'ring-1 ring-gray-200'
                        }`}
                    >
                      <img
                        src={image.preview}
                        alt={`Additional image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />

                      {hasMore && (
                        <div className="absolute rounded-lg inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                          <span className="text-white font-bold text-lg">+{remainingCount}</span>
                        </div>
                      )}


                      <div className="absolute top-0 right-0 size-3 bg-white rounded-full">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleRemoveOtherImage(image.id, index, e);
                          }}
                        >
                          <RoundCloseIcon className="absolute size-3 p-0 m-0 top-0 right-0 text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {otherImagesState.length < maxOtherImages && (
                  <div
                    onClick={handleClickOther}
                    className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all"
                  >
                    <PlusIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          )}

          <input
            ref={otherInputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleOtherFileSelect}
            className="hidden"
          />

          {otherError && (
            <p className="text-xs text-red-500 mt-1">{otherError}</p>
          )}
        </div>
      </div>

    </div>
  );
}
