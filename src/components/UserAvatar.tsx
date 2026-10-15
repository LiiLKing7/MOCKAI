import React from "react";
import { BotAvatar, BotAvatarType, botAvatarTypes } from "bot-avatars";

interface UserAvatarProps {
  avatar?: string | null;
  name?: string;
  size?: number;
  className?: string;
  state?: "default" | "working" | "sleeping";
  interactive?: boolean;
}

export function isBotAvatarType(val?: string | null): val is BotAvatarType {
  if (!val) return false;
  const clean = val.startsWith("bot:") ? val.replace("bot:", "") : val;
  return (botAvatarTypes as readonly string[]).includes(clean);
}

export function getBotType(val?: string | null): BotAvatarType {
  if (!val) return "droid";
  const clean = val.startsWith("bot:") ? val.replace("bot:", "") : val;
  if ((botAvatarTypes as readonly string[]).includes(clean)) {
    return clean as BotAvatarType;
  }
  return "droid";
}

export default function UserAvatar({
  avatar,
  name = "User",
  size = 40,
  className = "",
  state = "default",
  interactive = true,
}: UserAvatarProps) {
  // If it's a BotAvatar type or starts with "bot:"
  if (isBotAvatarType(avatar)) {
    const type = getBotType(avatar);
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <BotAvatar
          type={type}
          size={size}
          state={state}
          interactive={interactive}
          shading="plastic"
        />
      </div>
    );
  }

  // Fallback to image (DiceBear or standard URL)
  const imageSrc = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

  return (
    <img
      src={imageSrc}
      alt={name}
      style={{ width: size, height: size }}
      className={`rounded-xl object-cover shrink-0 ${className}`}
    />
  );
}
