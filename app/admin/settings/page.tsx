'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Settings, Database, Shield, Mail, Globe, Save } from 'lucide-react'

export default function SystemSettings() {
  const { showError, showSuccess } = useToast()
  
  // 系统设置状态
  const [settings, setSettings] = useState({
    siteName: 'VRCFace',
    siteDescription: 'VRChat 头像分享平台',
    allowRegistration: true,
    requireEmailVerification: true,
    maxFileSize: 50, // MB
    allowedFileTypes: '.vrm,.fbx,.blend',
    maintenanceMode: false,
    maintenanceMessage: '系统维护中，请稍后再试',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    enableNotifications: true,
    maxModelsPerUser: 100,
    autoApproveModels: false
  })

  const handleSaveSettings = async () => {
    try {
      // 这里应该调用保存设置的API
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
      //   },
      //   body: JSON.stringify(settings)
      // })
      
      // if (!response.ok) {
      //   throw new Error('保存设置失败')
      // }
      
      showSuccess('设置保存成功')
    } catch (error) {
      console.error('保存设置失败:', error)
      showError('保存设置失败')
    }
  }

  const updateSetting = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          保存设置
        </Button>
      </div>

      {/* 基本设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            基本设置
          </CardTitle>
          <CardDescription>
            配置网站的基本信息和显示设置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">网站名称</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
                placeholder="输入网站名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxModelsPerUser">每用户最大模型数</Label>
              <Input
                id="maxModelsPerUser"
                type="number"
                value={settings.maxModelsPerUser}
                onChange={(e) => updateSetting('maxModelsPerUser', parseInt(e.target.value))}
                placeholder="100"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteDescription">网站描述</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => updateSetting('siteDescription', e.target.value)}
              placeholder="输入网站描述"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* 用户设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            用户设置
          </CardTitle>
          <CardDescription>
            配置用户注册和验证相关设置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>允许用户注册</Label>
              <p className="text-sm text-gray-500">是否允许新用户注册账号</p>
            </div>
            <Switch
              checked={settings.allowRegistration}
              onCheckedChange={(checked: boolean) => updateSetting('allowRegistration', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>需要邮箱验证</Label>
              <p className="text-sm text-gray-500">新用户注册后是否需要验证邮箱</p>
            </div>
            <Switch
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked: boolean) => updateSetting('requireEmailVerification', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>自动审核模型</Label>
              <p className="text-sm text-gray-500">新上传的模型是否自动通过审核</p>
            </div>
            <Switch
              checked={settings.autoApproveModels}
              onCheckedChange={(checked: boolean) => updateSetting('autoApproveModels', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 文件上传设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            文件上传设置
          </CardTitle>
          <CardDescription>
            配置文件上传的限制和规则
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">最大文件大小 (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowedFileTypes">允许的文件类型</Label>
              <Input
                id="allowedFileTypes"
                value={settings.allowedFileTypes}
                onChange={(e) => updateSetting('allowedFileTypes', e.target.value)}
                placeholder=".vrm,.fbx,.blend"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 邮件设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            邮件设置
          </CardTitle>
          <CardDescription>
            配置SMTP服务器用于发送邮件通知
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-0.5">
              <Label>启用邮件通知</Label>
              <p className="text-sm text-gray-500">是否启用系统邮件通知功能</p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
            />
          </div>

          {settings.enableNotifications && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP 服务器</Label>
                <Input
                  id="smtpHost"
                  value={settings.smtpHost}
                  onChange={(e) => updateSetting('smtpHost', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP 端口</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
                  placeholder="587"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP 用户名</Label>
                <Input
                  id="smtpUser"
                  value={settings.smtpUser}
                  onChange={(e) => updateSetting('smtpUser', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP 密码</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                  placeholder="应用专用密码"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 维护模式 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            维护模式
          </CardTitle>
          <CardDescription>
            启用维护模式将阻止普通用户访问网站
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>启用维护模式</Label>
              <p className="text-sm text-gray-500">
                启用后，只有管理员可以访问网站
                {settings.maintenanceMode && (
                  <Badge variant="destructive" className="ml-2">
                    维护模式已启用
                  </Badge>
                )}
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked: boolean) => updateSetting('maintenanceMode', checked)}
            />
          </div>
          
          {settings.maintenanceMode && (
            <div className="space-y-2">
              <Label htmlFor="maintenanceMessage">维护提示信息</Label>
              <Textarea
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                placeholder="输入维护期间显示给用户的信息"
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 系统信息 */}
      <Card>
        <CardHeader>
          <CardTitle>系统信息</CardTitle>
          <CardDescription>
            当前系统的运行状态和版本信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">v1.0.0</div>
              <div className="text-sm text-gray-500">系统版本</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">运行中</div>
              <div className="text-sm text-gray-500">系统状态</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">Next.js</div>
              <div className="text-sm text-gray-500">技术栈</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}