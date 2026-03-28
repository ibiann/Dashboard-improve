"use client";

import { useId, useMemo, useRef, useState } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AlertTriangle, Camera, Check, Trash2, X } from "lucide-react";
import { ENG_PROFILE } from "@/lib/engineer-mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const LANCS_BLUE = "#063986";
const LANCS_ORANGE = "#E36C25";
const BIO_MAX = 500;

function countDigits(s: string): number {
  return (s.match(/\d/g) ?? []).length;
}

function validatePhone(v: string): string | null {
  const t = v.trim();
  if (!t) return "Vui lòng nhập số điện thoại.";
  const n = countDigits(t);
  if (n < 9 || n > 15) return "Số điện thoại không hợp lệ (cần 9–15 chữ số).";
  return null;
}

function validateBio(v: string): string | null {
  if (v.length > BIO_MAX) return `Giới thiệu vượt quá ${BIO_MAX} ký tự.`;
  return null;
}

type NotifState = {
  emailTasks: boolean;
  emailDigest: boolean;
  pushMobile: boolean;
  slackMentions: boolean;
};

function buildInitial() {
  return {
    phone: ENG_PROFILE.phone,
    workEmail: ENG_PROFILE.workEmail,
    bio: ENG_PROFILE.bio,
    githubUrl: ENG_PROFILE.githubUrl,
    linkedinUrl: ENG_PROFILE.linkedinUrl,
    skills: [...ENG_PROFILE.skills],
    avatarPreview: null as string | null,
    notif: {
      emailTasks: true,
      emailDigest: true,
      pushMobile: false,
      slackMentions: true,
    } satisfies NotifState,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

function computeProfileStrength(p: {
  phone: string;
  workEmail: string;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  skills: string[];
  avatarPreview: string | null;
}): number {
  let pts = 0;
  if (ENG_PROFILE.name.trim()) pts += 15;
  if (!validatePhone(p.phone)) pts += 15;
  if (p.workEmail.includes("@")) pts += 15;
  if (p.bio.trim().length >= 40) pts += 15;
  if (p.skills.length >= 3) pts += 20;
  if (p.githubUrl.trim() || p.linkedinUrl.trim()) pts += 10;
  if (p.avatarPreview) pts += 10;
  return Math.min(100, pts);
}

export function EngineerProfileSettings() {
  const baseId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(buildInitial);
  const [skillDraft, setSkillDraft] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [touchedPhone, setTouchedPhone] = useState(false);
  const [touchedBio, setTouchedBio] = useState(false);

  const strength = useMemo(
    () =>
      computeProfileStrength({
        phone: form.phone,
        workEmail: form.workEmail,
        bio: form.bio,
        githubUrl: form.githubUrl,
        linkedinUrl: form.linkedinUrl,
        skills: form.skills,
        avatarPreview: form.avatarPreview,
      }),
    [form.phone, form.workEmail, form.bio, form.githubUrl, form.linkedinUrl, form.skills, form.avatarPreview]
  );

  const incomplete = strength < 65;

  function revokeIfBlob(url: string | null) {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  }

  function handleCancel() {
    revokeIfBlob(form.avatarPreview);
    setForm(buildInitial());
    setSkillDraft("");
    setPhoneError(null);
    setBioError(null);
    setTouchedPhone(false);
    setTouchedBio(false);
    setSaveStatus("idle");
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSave() {
    const pe = validatePhone(form.phone);
    const be = validateBio(form.bio);
    setTouchedPhone(true);
    setTouchedBio(true);
    setPhoneError(pe);
    setBioError(be);
    if (pe || be) {
      setSaveStatus("error");
      return;
    }
    setSaveStatus("success");
    setTimeout(() => setSaveStatus("idle"), 4000);
  }

  function onPhoneBlur() {
    setTouchedPhone(true);
    setPhoneError(validatePhone(form.phone));
  }

  function onBioBlur() {
    setTouchedBio(true);
    setBioError(validateBio(form.bio));
  }

  function addSkill() {
    const t = skillDraft.trim();
    if (!t) return;
    if (form.skills.some((s) => s.toLowerCase() === t.toLowerCase())) {
      setSkillDraft("");
      return;
    }
    setForm((f) => ({ ...f, skills: [...f.skills, t] }));
    setSkillDraft("");
  }

  function removeSkill(s: string) {
    setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));
  }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setForm((prev) => {
      revokeIfBlob(prev.avatarPreview);
      return { ...prev, avatarPreview: URL.createObjectURL(f) };
    });
    e.target.value = "";
  }

  function onClearAvatar() {
    setForm((prev) => {
      revokeIfBlob(prev.avatarPreview);
      return { ...prev, avatarPreview: null };
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  const phoneInvalid = touchedPhone && !!phoneError;
  const bioInvalid = touchedBio && !!bioError;

  const actionBar = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button type="button" variant="ghost" className="min-h-9 focus-visible:ring-[3px] focus-visible:ring-offset-2" onClick={handleCancel}>
        Hủy bỏ
      </Button>
      <Button
        type="button"
        className="min-h-9 text-white shadow-sm focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:ring-[#063986]/40"
        style={{ backgroundColor: LANCS_BLUE }}
        onClick={handleSave}
      >
        Lưu thay đổi
      </Button>
    </div>
  );

  return (
    <div className={cn(GeistSans.className, "space-y-5 pb-28")}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Hồ sơ &amp; Cài đặt</h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            Cập nhật thông tin hiển thị, kỹ năng kỹ thuật và tùy chọn bảo mật. Dữ liệu kỹ năng hỗ trợ bản đồ nhiệt nguồn lực kỹ thuật.
          </p>
        </div>
        <div className="hidden md:block shrink-0">{actionBar}</div>
      </header>

      {saveStatus === "success" && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
        >
          <Check className="w-4 h-4 shrink-0" aria-hidden />
          Đã lưu thay đổi (mock — chưa gọi API).
        </div>
      )}
      {saveStatus === "error" && (phoneError || bioError) && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden />
          Vui lòng sửa các trường được đánh dấu lỗi trước khi lưu.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,30%)_minmax(0,70%)] lg:gap-8 items-start">
        {/* Cột trái — tóm tắt hồ sơ */}
        <aside
          className={cn(
            "rounded-xl border bg-white p-5 shadow-sm",
            incomplete && "border-l-4"
          )}
          style={incomplete ? { borderLeftColor: LANCS_ORANGE } : undefined}
        >
          {incomplete && (
            <div
              className="mb-4 flex items-start gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-white"
              style={{ backgroundColor: LANCS_ORANGE }}
              role="status"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              <span>Hồ sơ chưa đầy đủ — hoàn thiện để tăng độ tin cậy nội bộ.</span>
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <div className="relative pb-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                id={`${baseId}-avatar`}
                onChange={onAvatarChange}
                aria-label="Tải ảnh đại diện"
              />

              {/* Avatar: hover = overlay xoá ảnh (chỉ khi đã có ảnh) */}
              <div
                className={cn(
                  "group relative mx-auto size-28 shrink-0 overflow-hidden rounded-full border-2 border-slate-200/90 bg-slate-100 shadow-inner ring-2 ring-white",
                  form.avatarPreview && "cursor-default",
                )}
                aria-label="Ảnh đại diện"
              >
                {form.avatarPreview ? (
                  <img src={form.avatarPreview} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-2xl font-bold text-slate-500">
                    {ENG_PROFILE.initials}
                  </span>
                )}

                {form.avatarPreview ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity duration-300 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                    role="presentation"
                  >
                    <button
                      type="button"
                      className="pointer-events-auto flex max-w-[9rem] flex-col items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClearAvatar();
                      }}
                      aria-label="Xoá ảnh đại diện hiện tại"
                    >
                      <Trash2 className="size-6 shrink-0" strokeWidth={2} style={{ color: LANCS_ORANGE }} aria-hidden />
                      <span
                        className="text-center text-[11px] font-semibold leading-tight"
                        style={{ color: LANCS_ORANGE }}
                      >
                        Xoá ảnh đại diện
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Nút pill “Đổi ảnh” — giống mock: nổi, viền nhẹ, đổ bóng */}
              <button
                type="button"
                className={cn(
                  "absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 translate-y-[45%] items-center gap-1.5 rounded-full border border-slate-200/95 bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-md",
                  "transition-[box-shadow,background-color,transform] duration-200 hover:bg-slate-50 hover:shadow-lg",
                  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#063986]/35 focus-visible:ring-offset-2",
                )}
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="size-3.5 shrink-0 text-foreground/90" strokeWidth={1.75} aria-hidden />
                Đổi ảnh
              </button>
            </div>

            <p className="mt-7 text-base font-semibold text-foreground">{ENG_PROFILE.name}</p>
            <p className={cn(GeistMono.className, "mt-1 text-xs font-medium text-muted-foreground tracking-tight")}>
              Mã NV: {ENG_PROFILE.employeeId}
            </p>
            <p className="mt-2 text-sm text-foreground/90">{ENG_PROFILE.role}</p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground">Độ hoàn thiện hồ sơ</span>
              <span className={cn(GeistMono.className, "text-xs font-bold tabular-nums")} style={{ color: LANCS_BLUE }}>
                {strength}%
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={strength}
              aria-label="Độ hoàn thiện hồ sơ"
            >
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${strength}%`, backgroundColor: LANCS_BLUE }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Thêm ảnh, liên kết mạng xã hội và ít nhất ba kỹ năng kỹ thuật để đạt mức khuyến nghị.
            </p>
          </div>
        </aside>

        {/* Cột phải — tab cài đặt */}
        <section className="min-w-0 rounded-xl border bg-white p-4 sm:p-6 shadow-sm">
          <Tabs defaultValue="basic" className="gap-4">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-slate-100/80 p-1.5 rounded-lg">
              <TabsTrigger
                value="basic"
                className="text-xs sm:text-sm shrink-0 data-[state=active]:bg-[#063986] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Thông tin cơ bản
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="text-xs sm:text-sm shrink-0 data-[state=active]:bg-[#063986] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Kỹ năng &amp; Chuyên môn
              </TabsTrigger>
              <TabsTrigger
                value="notify"
                className="text-xs sm:text-sm shrink-0 data-[state=active]:bg-[#063986] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Thông báo
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="text-xs sm:text-sm shrink-0 data-[state=active]:bg-[#063986] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Bảo mật
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4 space-y-4 outline-none focus-visible:outline-none">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`${baseId}-fullname`}>Họ và tên đầy đủ</Label>
                  <Input
                    id={`${baseId}-fullname`}
                    value={ENG_PROFILE.name}
                    readOnly
                    aria-readonly="true"
                    className={cn(GeistMono.className, "bg-slate-50 text-muted-foreground")}
                  />
                  <p className="text-[11px] text-muted-foreground">Chỉ HRIS có quyền chỉnh sửa (doanh nghiệp).</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${baseId}-phone`}>Số điện thoại</Label>
                  <Input
                    id={`${baseId}-phone`}
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    onBlur={onPhoneBlur}
                    aria-invalid={phoneInvalid}
                    aria-describedby={phoneInvalid ? `${baseId}-phone-err` : undefined}
                    className={cn(phoneInvalid && "border-destructive")}
                  />
                  {phoneInvalid && (
                    <p id={`${baseId}-phone-err`} className="text-xs text-destructive" role="alert">
                      {phoneError}
                    </p>
                  )}
                  {!phoneInvalid && touchedPhone && form.phone && (
                    <p className="text-xs text-emerald-700 flex items-center gap-1" role="status">
                      <Check className="w-3.5 h-3.5" aria-hidden /> Định dạng hợp lệ
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${baseId}-email`}>Email công việc</Label>
                  <Input
                    id={`${baseId}-email`}
                    type="email"
                    value={form.workEmail}
                    onChange={(e) => setForm((f) => ({ ...f, workEmail: e.target.value }))}
                    className={GeistMono.className}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`${baseId}-bio`}>Giới thiệu / Về tôi</Label>
                  <Textarea
                    id={`${baseId}-bio`}
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    onBlur={onBioBlur}
                    aria-invalid={bioInvalid}
                    aria-describedby={`${baseId}-bio-count ${bioInvalid ? `${baseId}-bio-err` : ""}`}
                    rows={5}
                    className={cn(bioInvalid && "border-destructive")}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      id={`${baseId}-bio-count`}
                      className={cn(
                        "text-xs tabular-nums",
                        form.bio.length > BIO_MAX ? "text-destructive font-medium" : "text-muted-foreground"
                      )}
                    >
                      {form.bio.length}/{BIO_MAX} ký tự
                    </span>
                    {bioInvalid && (
                      <p id={`${baseId}-bio-err`} className="text-xs text-destructive" role="alert">
                        {bioError}
                      </p>
                    )}
                  </div>
                  {!bioInvalid && form.bio.length > 0 && form.bio.length <= BIO_MAX && (
                    <p className="text-xs text-emerald-700 flex items-center gap-1" role="status">
                      <Check className="w-3.5 h-3.5" aria-hidden /> Trong giới hạn cho phép
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`${baseId}-gh`}>GitHub</Label>
                  <Input
                    id={`${baseId}-gh`}
                    placeholder="https://github.com/..."
                    value={form.githubUrl}
                    onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
                    className={GeistMono.className}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`${baseId}-li`}>LinkedIn</Label>
                  <Input
                    id={`${baseId}-li`}
                    placeholder="https://www.linkedin.com/in/..."
                    value={form.linkedinUrl}
                    onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                    className={GeistMono.className}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="mt-4 space-y-4 outline-none">
              <p className="text-xs text-muted-foreground">
                Nhập kỹ năng kỹ thuật (ví dụ FPGA, C++, Verilog). Nhấn Enter để thêm. Các thẻ này được CTO dùng cho heatmap nguồn lực.
              </p>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/50">
                {form.skills.map((s) => (
                  <span
                    key={s}
                    className={cn(
                      GeistMono.className,
                      "inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-foreground shadow-sm"
                    )}
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#063986] focus-visible:ring-offset-1"
                      aria-label={`Xóa kỹ năng ${s}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 flex-col sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${baseId}-skill`}>Thêm kỹ năng</Label>
                  <Input
                    id={`${baseId}-skill`}
                    value={skillDraft}
                    onChange={(e) => setSkillDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="VD: FPGA, SystemVerilog…"
                    className={GeistMono.className}
                  />
                </div>
                <Button type="button" variant="secondary" className="sm:mb-0.5 shrink-0" onClick={addSkill}>
                  Thêm
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notify" className="mt-4 space-y-6 outline-none">
              <NotifRow
                id={`${baseId}-n1`}
                label="Email khi có task mới / thay đổi"
                checked={form.notif.emailTasks}
                onCheckedChange={(v) => setForm((f) => ({ ...f, notif: { ...f.notif, emailTasks: v } }))}
              />
              <NotifRow
                id={`${baseId}-n2`}
                label="Tóm tắt email hàng tuần"
                checked={form.notif.emailDigest}
                onCheckedChange={(v) => setForm((f) => ({ ...f, notif: { ...f.notif, emailDigest: v } }))}
              />
              <NotifRow
                id={`${baseId}-n3`}
                label="Thông báo đẩy trên di động (Lancs Mobile)"
                checked={form.notif.pushMobile}
                onCheckedChange={(v) => setForm((f) => ({ ...f, notif: { ...f.notif, pushMobile: v } }))}
              />
              <NotifRow
                id={`${baseId}-n4`}
                label="Slack — nhắc khi được mention"
                checked={form.notif.slackMentions}
                onCheckedChange={(v) => setForm((f) => ({ ...f, notif: { ...f.notif, slackMentions: v } }))}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-4 space-y-4 outline-none max-w-md">
              <p className="text-xs text-muted-foreground">
                Đăng nhập SSO doanh nghiệp. Đổi mật khẩu chỉ áp dụng nếu tài khoản dùng mật khẩu cục bộ.
              </p>
              <div className="space-y-2">
                <Label htmlFor={`${baseId}-pw0`}>Mật khẩu hiện tại</Label>
                <Input
                  id={`${baseId}-pw0`}
                  type="password"
                  autoComplete="current-password"
                  value={form.currentPassword}
                  onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${baseId}-pw1`}>Mật khẩu mới</Label>
                <Input
                  id={`${baseId}-pw1`}
                  type="password"
                  autoComplete="new-password"
                  value={form.newPassword}
                  onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${baseId}-pw2`}>Xác nhận mật khẩu mới</Label>
                <Input
                  id={`${baseId}-pw2`}
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Mật khẩu tối thiểu 12 ký tự, gồm chữ hoa, chữ thường và số (theo chính sách Lancs).
              </p>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      {/* Thanh hành động cố định (mobile + desktop) */}
      <div className="sticky bottom-0 z-30 mt-8 border-t border-border bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] -mx-1 px-1 sm:mx-0 sm:px-0">
        <div className="flex justify-end">{actionBar}</div>
      </div>
    </div>
  );
}

function NotifRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-3">
      <Label htmlFor={id} className="text-sm font-medium cursor-pointer flex-1">
        {label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-[#063986] shrink-0 focus-visible:ring-[3px] focus-visible:ring-offset-2"
      />
    </div>
  );
}
