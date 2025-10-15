'use client';

import { ArrowLeft, Download, Copy, Upload, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function QuickStartTutorial() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-8">
          <Link 
            href="/docs" 
            className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('docs.backToDocs')}
          </Link>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('docs.tutorial.quickStart.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('docs.tutorial.quickStart.subtitle')}
          </p>
        </div>

        {/* 教程内容 */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="prose max-w-none">
              <div className="space-y-8">
                {/* 步骤 1 */}
                <div className="step">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      1
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 m-0">
                      {t('docs.tutorial.quickStart.steps.step1.title')}
                    </h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-600 mb-4">
                      {t('docs.tutorial.quickStart.steps.step1.description')}
                    </p>
                  </div>
                </div>

                {/* 步骤 2 */}
                <div className="step">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      2
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 m-0">
                      {t('docs.tutorial.quickStart.steps.step2.title')}
                    </h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-600 mb-4">
                      {t('docs.tutorial.quickStart.steps.step2.description')}
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                      <a 
                        href="https://github.com/oniyakun/VRChat-BlendShapes-Extractor/releases" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        https://github.com/oniyakun/VRChat-BlendShapes-Extractor/releases
                      </a>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                      <p className="text-blue-800 text-sm">
                        <strong>{t('docs.tutorial.quickStart.steps.step2.tip.label')}</strong>{t('docs.tutorial.quickStart.steps.step2.tip.content')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 步骤 3 */}
                <div className="step">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      3
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 m-0">
                      {t('docs.tutorial.quickStart.steps.step3.title')}
                    </h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-600 mb-4">
                      {t('docs.tutorial.quickStart.steps.step3.description')}
                    </p>
                  </div>
                </div>

                {/* 步骤 4 */}
                <div className="step">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      4
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 m-0">
                      {t('docs.tutorial.quickStart.steps.step4.title')}
                    </h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-600 mb-4">
                      {t('docs.tutorial.quickStart.steps.step4.description')}
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                      <img 
                        src="https://rdiuemzozvoqhcelrdnw.supabase.co/storage/v1/object/public/model-images/tutorial/2.png" 
                        alt={t('docs.tutorial.quickStart.steps.step4.imageAlt')}
                        className="w-full rounded-lg shadow-md"
                      />
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        {t('docs.tutorial.quickStart.steps.step4.imageCaption')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 步骤 5 */}
                <div className="step">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      5
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 m-0">
                      {t('docs.tutorial.quickStart.steps.step5.title')}
                    </h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-600 mb-4">
                      {t('docs.tutorial.quickStart.steps.step5.description')}
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                      <img 
                        src="https://rdiuemzozvoqhcelrdnw.supabase.co/storage/v1/object/public/model-images/tutorial/3.png" 
                        alt={t('docs.tutorial.quickStart.steps.step5.imageAlt')}
                        className="w-full rounded-lg shadow-md"
                      />
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        {t('docs.tutorial.quickStart.steps.step5.imageCaption')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 步骤 6 */}
                <div className="step">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      6
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 m-0">
                      {t('docs.tutorial.quickStart.steps.step6.title')}
                    </h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-600 mb-4">
                      {t('docs.tutorial.quickStart.steps.step6.description')}
                    </p>
                  </div>
                </div>

                {/* 步骤 7 */}
                <div className="step">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      7
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 m-0">
                      {t('docs.tutorial.quickStart.steps.step7.title')}
                    </h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-600 mb-4">
                      {t('docs.tutorial.quickStart.steps.step7.description')}
                    </p>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <p className="text-green-800 text-sm">
                        <strong>{t('docs.tutorial.quickStart.steps.step7.success.label')}</strong>{t('docs.tutorial.quickStart.steps.step7.success.content')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}