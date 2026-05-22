import { MapPin } from "lucide-react";
import { profile } from "./links-data";

export function ProfileHeader() {
  const initial = profile.name.trim().charAt(0).toUpperCase();
  return (
    <header className="flex flex-col items-center text-center animate-fade-up">
      <div className="relative">
        <div
          className="absolute -inset-1.5 rounded-full opacity-80 blur-lg"
          style={{ background: "var(--gradient-primary)" }}
          aria-hidden
        />
        {profile.image ? (
          <img
            src={profile.image}
            alt={`${profile.name} portrait`}
            width={112}
            height={112}
            className="relative h-28 w-28 rounded-full object-cover ring-4 ring-background shadow-[var(--shadow-card)]"
          />
        ) : (
          <div
            aria-label={`${profile.name} avatar`}
            className="relative flex h-28 w-28 items-center justify-center rounded-full ring-4 ring-background shadow-[var(--shadow-card)] text-4xl font-bold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            {initial}
          </div>
        )}
      </div>
      <h1 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
        {profile.name}
      </h1>
      <p className="mt-1 inline-flex items-center justify-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        {profile.location}
      </p>
      <p className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 text-[15px] leading-relaxed text-foreground/85">
        <span className="relative inline-flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-highlight opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-highlight" />
          </span>
          <span className="font-medium">{profile.status}</span>
        </span>
        <span aria-hidden className="text-muted-foreground/60">·</span>
        <span className="text-foreground/75">{profile.graduation}</span>
      </p>
    </header>
  );
}