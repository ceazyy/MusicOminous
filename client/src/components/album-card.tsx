import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CountdownTimer from "./countdown-timer";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import type { Album } from "@shared/schema";
import ns008Image from "@assets/NS008.jpg";
import evolutionImage from "@assets/EVOLUTION.png";

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const { isPlaying, currentTrack, playTrack, stopTrack } = useAudioPlayer();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();

  const handlePlayClick = () => {
    if (isPlaying && currentTrack === album.id) {
      stopTrack();
    } else {
      // Simulate audio playback with track ID
      playTrack(album.id, album.previewUrl || "");
    }
  };

  const handlePurchase = async () => {
    try {
      // Navigate to checkout with album data
      navigate('/checkout', {
        state: {
          checkoutData: {
            album: {
              id: album.id,
              title: album.title,
              price: album.price,
              coverImage: album.coverImage
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initiating purchase:', error);
    }
  };

  // Get the correct image source
  const getImageSrc = () => {
    if (album.title === "WICKED GENERATION") return ns008Image;
    if (album.title === "EVOLUTION") return evolutionImage;
    return album.coverImage;
  };

  const isCurrentlyPlaying = isPlaying && currentTrack === album.id;

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        <img
          src={getImageSrc()}
          alt={album.title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{album.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{album.catalog}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">${album.price}</span>
          <Button
            onClick={handlePurchase}
            disabled={!album.isReleased}
          >
            {album.isReleased ? 'Purchase' : 'Coming Soon'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
