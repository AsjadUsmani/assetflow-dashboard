"use client";

import {
  Building2,
  MapPin,
  Bell,
  Palette,
  Lock,
  Database,
  Globe,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="organization" className="space-y-6">
      <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="organization" className="gap-2">
          <Building2 className="size-4" />
          Organization
        </TabsTrigger>
        <TabsTrigger value="locations" className="gap-2">
          <MapPin className="size-4" />
          Locations
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="size-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="appearance" className="gap-2">
          <Palette className="size-4" />
          Appearance
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-2">
          <Lock className="size-4" />
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="organization" className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Organization Details</CardTitle>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" defaultValue="Acme Corporation" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-code">Organization Code</Label>
                <Input id="org-code" defaultValue="ACME-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select defaultValue="technology">
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc-8">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-8">
                      Pacific Time (UTC-8)
                    </SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="utc+1">
                      Central European (UTC+1)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                defaultValue="123 Business Ave, Suite 100&#10;San Francisco, CA 94102"
                rows={2}
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Asset Configuration</CardTitle>
            <CardDescription>
              Default settings for asset management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="asset-prefix">Asset Tag Prefix</Label>
                <Input id="asset-prefix" defaultValue="AST" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (Euro)</SelectItem>
                    <SelectItem value="gbp">GBP (Pound)</SelectItem>
                    <SelectItem value="inr">INR (Rupee)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="depreciation">Default Depreciation Method</Label>
                <Select defaultValue="straight-line">
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight-line">Straight Line</SelectItem>
                    <SelectItem value="declining">Declining Balance</SelectItem>
                    <SelectItem value="units">Units of Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiscal-year">Fiscal Year Start</Label>
                <Select defaultValue="january">
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="january">January</SelectItem>
                    <SelectItem value="april">April</SelectItem>
                    <SelectItem value="july">July</SelectItem>
                    <SelectItem value="october">October</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="locations" className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Locations</CardTitle>
                <CardDescription>
                  Manage organization locations and branches
                </CardDescription>
              </div>
              <Button size="sm">
                <MapPin className="mr-2 size-4" />
                Add Location
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "Headquarters",
                  address: "123 Business Ave, San Francisco",
                  assets: 245,
                },
                {
                  name: "Branch Office 1",
                  address: "456 Commerce St, New York",
                  assets: 128,
                },
                {
                  name: "Branch Office 2",
                  address: "789 Market Rd, Chicago",
                  assets: 87,
                },
              ].map((location) => (
                <div
                  key={location.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MapPin className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {location.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {location.assets} assets
                    </span>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Email Notifications</CardTitle>
            <CardDescription>
              Configure when to receive email alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Asset Expiry Alerts",
                description:
                  "Notify when warranties or licenses are expiring",
              },
              {
                title: "Movement Approvals",
                description: "Notify when asset movements need approval",
              },
              {
                title: "New User Registrations",
                description: "Notify when new users join the organization",
              },
              {
                title: "Low Stock Alerts",
                description: "Notify when consumable items are running low",
              },
              {
                title: "Maintenance Reminders",
                description: "Notify about upcoming scheduled maintenance",
              },
            ].map((setting) => (
              <div
                key={setting.title}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{setting.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Alert Thresholds</CardTitle>
            <CardDescription>
              Set thresholds for automatic alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Warranty Expiry Warning (days)</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label>License Expiry Warning (days)</Label>
                <Input type="number" defaultValue="14" />
              </div>
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label>Maintenance Reminder (days before)</Label>
                <Input type="number" defaultValue="7" />
              </div>
            </div>
            <Button>Save Thresholds</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance" className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Branding</CardTitle>
            <CardDescription>
              Customize the look and feel of your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Logo</Label>
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Building2 className="size-8 text-primary" />
                </div>
                <Button variant="outline">Upload Logo</Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary border border-border" />
                <Input defaultValue="#2dd4bf" className="max-w-32" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Enable dark mode by default
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button>Save Appearance</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Authentication</CardTitle>
            <CardDescription>
              Configure security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all users
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Single Sign-On (SSO)</p>
                <p className="text-sm text-muted-foreground">
                  Enable SAML/OIDC authentication
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">
                  Auto-logout after inactivity
                </p>
              </div>
              <Select defaultValue="60">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Password Policy</Label>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Switch defaultChecked id="min-length" />
                  <Label htmlFor="min-length" className="font-normal">
                    Minimum 8 characters
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked id="uppercase" />
                  <Label htmlFor="uppercase" className="font-normal">
                    Require uppercase letter
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked id="number" />
                  <Label htmlFor="number" className="font-normal">
                    Require number
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="special" />
                  <Label htmlFor="special" className="font-normal">
                    Require special character
                  </Label>
                </div>
              </div>
            </div>
            <Button>Save Security Settings</Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">API Access</CardTitle>
            <CardDescription>
              Manage API keys and integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">Production API Key</p>
                <code className="text-xs text-muted-foreground">
                  sk_live_****************************abcd
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Reveal
                </Button>
                <Button variant="outline" size="sm">
                  Regenerate
                </Button>
              </div>
            </div>
            <Button variant="outline">
              <Database className="mr-2 size-4" />
              Generate New API Key
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
