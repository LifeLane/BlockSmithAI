"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ApiKeys {
  [key: string]: string;
}

interface ApiKeyContextType {
  apiKeys: ApiKeys;
  setApiKey: (key: string, value: string) => void;
  removeApiKey: (key: string) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setApiKey = useCallback((key: string, value: string) => {
    setApiKeys(prevKeys => ({ ...prevKeys, [key]: value }));
  }, []);

  const removeApiKey = useCallback((key: string) => {
    setApiKeys(prevKeys => {
      const newKeys = { ...prevKeys };
      delete newKeys[key];
      return newKeys;
    });
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <ApiKeyContext.Provider value={{ apiKeys, setApiKey, removeApiKey, isModalOpen, openModal, closeModal }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKeys = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider');
  }
  return context;
};
