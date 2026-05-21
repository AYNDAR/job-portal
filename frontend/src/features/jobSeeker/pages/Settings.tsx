// features/jobSeeker/pages/Settings.tsx
import { useState, useRef } from "react";
import {
  User,
  Bell,
  Lock,
  Save,
  Camera,
  Upload,
  CheckCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Separator } from "../../../components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";

export default function SettingsPage() {
  // Profile state
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    location: "New York, NY",
    title: "Full Stack Developer",
    avatarUrl: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    jobRecommendations: true,
    applicationUpdates: true,
    marketingEmails: false,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaveMessage(""); // clear previous message on change
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      // Replace with real API call
      // const response = await api.post('/upload-avatar', formData);
      // setProfile({ ...profile, avatarUrl: response.data.url });
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProfile({ ...profile, avatarUrl: previewUrl });
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      // Replace with real API call: await api.put('/profile', profile);
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log("Profile saved:", profile);
      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("Error saving profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    setNotifMessage("");
    try {
      // Replace with real API call: await api.put('/notifications/preferences', notifications);
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Notification preferences saved:", notifications);
      setNotifMessage("Notification preferences saved!");
      setTimeout(() => setNotifMessage(""), 3000);
    } catch (error) {
      setNotifMessage("Error saving preferences.");
    } finally {
      setSavingNotifs(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const currentPwd = (
      form.elements.namedItem("currentPassword") as HTMLInputElement
    ).value;
    const newPwd = (form.elements.namedItem("newPassword") as HTMLInputElement)
      .value;
    const confirmPwd = (
      form.elements.namedItem("confirmPassword") as HTMLInputElement
    ).value;

    if (newPwd !== confirmPwd) {
      alert("New passwords do not match");
      return;
    }
    console.log("Password change requested", { currentPwd, newPwd });
    alert("Password changed successfully (mock)");
    form.reset();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">
          Manage your account preferences and profile
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-4 border-b">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={
                        avatarPreview ||
                        profile.avatarUrl ||
                        "https://github.com/shadcn.png"
                      }
                    />
                    <AvatarFallback className="text-2xl bg-purple-100 text-purple-800">
                      {profile.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Camera size={16} className="text-gray-600" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm font-medium">Profile Picture</p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="mt-2"
                  >
                    <Upload size={14} className="mr-1" />{" "}
                    {uploading ? "Uploading..." : "Upload new photo"}
                  </Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={profile.location}
                    onChange={handleProfileChange}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={profile.title}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              {/* Save Button with feedback */}
              {saveMessage && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle size={16} /> {saveMessage}
                </div>
              )}
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="mt-2"
              >
                <Save size={16} className="mr-2" />{" "}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={20} /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" required />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" required />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" required />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab – fully functional */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} /> Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Alerts</p>
                  <p className="text-sm text-gray-500">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({ ...notifications, emailAlerts: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Job Recommendations</p>
                  <p className="text-sm text-gray-500">
                    Get personalized job recommendations
                  </p>
                </div>
                <Switch
                  checked={notifications.jobRecommendations}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({
                      ...notifications,
                      jobRecommendations: checked,
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Application Updates</p>
                  <p className="text-sm text-gray-500">
                    Notify me when application status changes
                  </p>
                </div>
                <Switch
                  checked={notifications.applicationUpdates}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({
                      ...notifications,
                      applicationUpdates: checked,
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-gray-500">
                    Receive tips, news, and promotions
                  </p>
                </div>
                <Switch
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked: boolean) =>
                    setNotifications({
                      ...notifications,
                      marketingEmails: checked,
                    })
                  }
                />
              </div>

              {/* Save button for notifications */}
              {notifMessage && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle size={16} /> {notifMessage}
                </div>
              )}
              <Button
                onClick={handleSaveNotifications}
                disabled={savingNotifs}
                className="mt-2"
              >
                {savingNotifs ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
