"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, RefreshCw } from "lucide-react"
import { adminApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuthContext } from "@/contexts/AuthContext"

export default function SettingsPage() {
  const { toast } = useToast()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  
  const [settings, setSettings] = useState({
    general: {
      siteName: "Victoria Spares",
      siteDescription: "Your one-stop shop for quality auto parts and accessories",
      contactEmail: "info@victoriaspares.com",
      contactPhone: "+254 712 345 678",
      address: "123 Mombasa Road, Nairobi, Kenya",
    },
    store: {
      currency: "KES",
      currencySymbol: "Ksh",
      taxRate: 16,
      enableTax: true,
      showOutOfStock: true,
      allowBackorders: false,
      lowStockThreshold: 5,
    },
    notifications: {
      orderConfirmation: true,
      orderStatusUpdate: true,
      lowStockAlert: true,
      newProductAlert: false,
      marketingEmails: false,
    },
  })

  useEffect(() => {
    localStorage.setItem('previousPath', window.location.pathname)
    const load = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/settings`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data?.data) setSettings(data.data)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({ title: "Access Denied", description: "You don't have permission to access this page.", variant: "destructive" })
      window.history.back()
    }
  }, [user, toast])

  const handleGeneralChange = (e) => {
    const { name, value } = e.target
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [name]: value,
      },
    })
  }

  const handleStoreChange = (e) => {
    const { name, value, type } = e.target
    setSettings({
      ...settings,
      store: {
        ...settings.store,
        [name]: type === "number" ? Number(value) : value,
      },
    })
  }

  const handleSwitchChange = (name, checked, section) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [name]: checked,
      },
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: settings }),
      })
      if (!res.ok) throw new Error('Failed to save settings')
      toast({ title: 'Settings saved', description: 'Your settings have been updated successfully.' })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetSettings = () => {
    setSettings({
      general: {
        siteName: "Victoria Spares",
        siteDescription: "Your one-stop shop for quality auto parts and accessories",
        contactEmail: "info@victoriaspares.com",
        contactPhone: "+254 712 345 678",
        address: "123 Mombasa Road, Nairobi, Kenya",
      },
      store: {
        currency: "KES",
        currencySymbol: "Ksh",
        taxRate: 16,
        enableTax: true,
        showOutOfStock: true,
        allowBackorders: false,
        lowStockThreshold: 5,
      },
      notifications: {
        orderConfirmation: true,
        orderStatusUpdate: true,
        lowStockAlert: true,
        newProductAlert: false,
        marketingEmails: false,
      },
    })
    toast({
      title: "Settings reset",
      description: "Settings have been reset to default values.",
    })
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your store settings and preferences.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetSettings} disabled={saving || loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="store">Store</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>
                    Update your store's basic information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Store Name</Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={settings.general.siteName}
                      onChange={handleGeneralChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Store Description</Label>
                    <Textarea
                      id="siteDescription"
                      name="siteDescription"
                      value={settings.general.siteDescription}
                      onChange={handleGeneralChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={handleGeneralChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={settings.general.contactPhone}
                        onChange={handleGeneralChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Store Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={settings.general.address}
                      onChange={handleGeneralChange}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="store" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                  <CardDescription>
                    Configure how your store operates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        name="currency"
                        value={settings.store.currency}
                        onChange={handleStoreChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currencySymbol">Currency Symbol</Label>
                      <Input
                        id="currencySymbol"
                        name="currencySymbol"
                        value={settings.store.currencySymbol}
                        onChange={handleStoreChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      name="taxRate"
                      type="number"
                      value={settings.store.taxRate}
                      onChange={handleStoreChange}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableTax">Enable Tax Calculation</Label>
                        <p className="text-sm text-muted-foreground">Apply tax to product prices during checkout.</p>
                      </div>
                      <Switch
                        id="enableTax"
                        checked={settings.store.enableTax}
                        onCheckedChange={(checked) => handleSwitchChange('enableTax', checked, 'store')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="showOutOfStock">Show Out of Stock Products</Label>
                        <p className="text-sm text-muted-foreground">Display products that are currently out of stock.</p>
                      </div>
                      <Switch
                        id="showOutOfStock"
                        checked={settings.store.showOutOfStock}
                        onCheckedChange={(checked) => handleSwitchChange('showOutOfStock', checked, 'store')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowBackorders">Allow Backorders</Label>
                        <p className="text-sm text-muted-foreground">Allow customers to order products that are out of stock.</p>
                      </div>
                      <Switch
                        id="allowBackorders"
                        checked={settings.store.allowBackorders}
                        onCheckedChange={(checked) => handleSwitchChange('allowBackorders', checked, 'store')}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      name="lowStockThreshold"
                      type="number"
                      value={settings.store.lowStockThreshold}
                      onChange={handleStoreChange}
                    />
                    <p className="text-xs text-muted-foreground">Number of items that triggers a low stock alert.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure which notifications you want to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="orderConfirmation">Order Confirmation</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when a new order is placed.</p>
                    </div>
                    <Switch
                      id="orderConfirmation"
                      checked={settings.notifications.orderConfirmation}
                      onCheckedChange={(checked) => handleSwitchChange('orderConfirmation', checked, 'notifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="orderStatusUpdate">Order Status Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when an order status changes.</p>
                    </div>
                    <Switch
                      id="orderStatusUpdate"
                      checked={settings.notifications.orderStatusUpdate}
                      onCheckedChange={(checked) => handleSwitchChange('orderStatusUpdate', checked, 'notifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="lowStockAlert">Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when products are running low.</p>
                    </div>
                    <Switch
                      id="lowStockAlert"
                      checked={settings.notifications.lowStockAlert}
                      onCheckedChange={(checked) => handleSwitchChange('lowStockAlert', checked, 'notifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="newProductAlert">New Product Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when new products are added.</p>
                    </div>
                    <Switch
                      id="newProductAlert"
                      checked={settings.notifications.newProductAlert}
                      onCheckedChange={(checked) => handleSwitchChange('newProductAlert', checked, 'notifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive promotional emails and special offers.</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={settings.notifications.marketingEmails}
                      onCheckedChange={(checked) => handleSwitchChange('marketingEmails', checked, 'notifications')}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  )
}
