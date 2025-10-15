'use client';

import { ArrowLeft, Code, Download, Upload, Copy } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { translations } from '@/lib/translations';

export default function BlendShapesTutorialPage() {
  const { t, language } = useLanguage();

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
            {t('docs.tutorial.blendshapes.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('docs.tutorial.blendshapes.subtitle')}
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
                      {t('docs.tutorial.blendshapes.steps.step1.title')}
                    </h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-600 mb-4">
                      {t('docs.tutorial.blendshapes.steps.step1.description')}
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
                        <strong>提示：</strong>{t('docs.tutorial.blendshapes.steps.step1.tip')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 步骤 2 */}
                <div className="step">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      2
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 m-0">
                      {t('docs.tutorial.blendshapes.steps.step2.title')}
                    </h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-600 mb-4">
                      {t('docs.tutorial.blendshapes.steps.step2.description')}
                    </p>
                    <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-4">
                      {(translations[language].docs.tutorial.blendshapes.steps.step2.steps as string[]).map((step: string, index: number) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: step }} />
                      ))}
                    </ol>
                  </div>
                </div>

                {/* 步骤 3 */}
                <div className="step">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      3
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 m-0">
                      {t('docs.tutorial.blendshapes.steps.step3.title')}
                    </h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-600 mb-4">
                      {t('docs.tutorial.blendshapes.steps.step3.description')}
                    </p>
                    <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-4">
                    {(translations[language].docs.tutorial.blendshapes.steps.step3.steps as string[]).map((step: string, index: number) => (
                      <li key={index} dangerouslySetInnerHTML={{ __html: step }} />
                    ))}
                  </ol>
                    <div className="bg-gray-50 rounded-lg p-4 border mb-4">
                      <img 
                        src="https://rdiuemzozvoqhcelrdnw.supabase.co/storage/v1/object/public/model-images/tutorial/1.png" 
                        alt="BlendShape Extractor 使用示例"
                        className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                      />
                      <p className="text-center text-sm text-gray-500 mt-2">
                        BlendShape Extractor 工具界面示例
                      </p>
                    </div>
                  </div>
                </div>

                {/* 步骤 4 */}
                <div className="step">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      4
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 m-0">
                      {t('docs.tutorial.blendshapes.steps.step4.title')}
                    </h2>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-600 mb-4">
                      {t('docs.tutorial.blendshapes.steps.step4.description')}
                    </p>
                    <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-4">
                    {(translations[language].docs.tutorial.blendshapes.steps.step4.steps as string[]).map((step: string, index: number) => (
                      <li key={index} dangerouslySetInnerHTML={{ __html: step }} />
                    ))}
                  </ol>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <p className="text-green-800 text-sm">
                        <strong>成功！</strong>{t('docs.tutorial.blendshapes.steps.step4.success')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 常见问题 */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('docs.tutorial.blendshapes.faq.title')}</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Q: {t('docs.tutorial.blendshapes.faq.q1.question')}
                    </h3>
                    <p className="text-gray-600">
                      A: {t('docs.tutorial.blendshapes.faq.q1.answer')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Q: {t('docs.tutorial.blendshapes.faq.q2.question')}
                    </h3>
                    <p className="text-gray-600">
                      A: {t('docs.tutorial.blendshapes.faq.q2.answer')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Q: {t('docs.tutorial.blendshapes.faq.q3.question')}
                    </h3>
                    <p className="text-gray-600">
                      A: {t('docs.tutorial.blendshapes.faq.q3.answer')}
                    </p>
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