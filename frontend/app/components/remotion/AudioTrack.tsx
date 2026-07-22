import React from "react";
import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig, interpolate } from "remotion";

interface AudioTrackProps {
  src: string;
  volume?: number;
  startFrom?: number; // 開始フレーム
  endAt?: number; // 終了フレーム
  fadeIn?: number; // フェードイン秒数
  fadeOut?: number; // フェードアウト秒数
  loop?: boolean;
}

export const AudioTrack: React.FC<AudioTrackProps> = ({
  src,
  volume = 1,
  startFrom = 0,
  endAt,
  fadeIn = 0,
  fadeOut = 0,
  loop = false,
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  // フェードイン/フェードアウトのボリュームカーブー
  const volumeCallback = (frame: number): number => {
    let v = volume;

    // フェードイン
    if (fadeIn > 0) {
      const fadeInFrames = fadeIn * fps;
      if (frame < fadeInFrames) {
        v *= interpolate(frame, [0, fadeInFrames], [0, 1], {
          extrapolateRight: "clamp",
        });
      }
    }

    // フェードアウト
    if (fadeOut > 0) {
      const fadeOutFrames = fadeOut * fps;
      const fadeOutStart = durationInFrames - fadeOutFrames;
      if (frame > fadeOutStart) {
        v *= interpolate(frame, [fadeOutStart, durationInFrames], [1, 0], {
          extrapolateRight: "clamp",
        });
      }
    }

    return v;
  };

  // トリミング設定
  const trimBefore = startFrom;
  const trimAfter = endAt ? durationInFrames - endAt : undefined;

  // リモートURLか静的ファイルか
  const isRemoteUrl = src.startsWith("http");

  return (
    <Audio
      src={isRemoteUrl ? src : staticFile(src)}
      volume={fadeIn > 0 || fadeOut > 0 ? volumeCallback : volume}
      trimBefore={trimBefore}
      trimAfter={trimAfter}
      loop={loop}
    />
  );
};

export default AudioTrack;
