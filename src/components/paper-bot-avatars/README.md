# Paper Bot Avatars

A standalone React + TypeScript set of 18 paper-cutout avatars. Each shape has its own idle loop and its own one-shot hover reaction. Hovering compresses the whole avatar into a paper-like squash and lets it spring back; the eyes stay fixed and **do not follow the cursor**.

## Files

- `PaperBotAvatar.tsx` — component and SVG shapes
- `paper-bot-avatars.css` — paper styling, distinct per-avatar animation, squash/stretch feedback

## Install/use

Copy both files into your React project, making sure the CSS import resolves, then:

```tsx
import PaperBotAvatar from './PaperBotAvatar';

export function AvatarDemo() {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <PaperBotAvatar type="clover" size={72} />
      <PaperBotAvatar type="blob" size={72} />
      <PaperBotAvatar type="mech" size={72} state="working" />
      <PaperBotAvatar type="ghost" size={72} state="sleeping" />
    </div>
  );
}
```

## Props

- `type`: `clover | flower | triangle | square | blob | ghost | circle | drop | star | droid | mech | alien | hexagon | cat | cloud | pill | pebble | puddle`
- `state`: `default | working | sleeping`
- `size`: number in pixels or a CSS size string
- `color`: override the paper fill
- `face`: `eyes` or `mouth` (adds a small smile when set to `mouth`)
- `seed`: offsets the animation timing and alters the paper grain
- `paused`: pauses CSS animation
- `interactive`: enables click feedback; false also removes it from keyboard tab order
- `label`: accessible label override
- `className`: extra class on the button

The component intentionally does not track pointer position, so eye direction never shifts when a cursor enters the avatar. Hover reactions only run on devices with a fine pointer; reduced-motion preferences are respected.
