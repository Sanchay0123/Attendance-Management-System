import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { type Class } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface QRGeneratorProps {
  classes: Class[];
}

export default function QRGenerator({ classes }: QRGeneratorProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!selectedClass) return;

    const updateQR = async () => {
      await generateQR(parseInt(selectedClass));
      // Only schedule next update after current QR is generated
      timerRef.current = setTimeout(updateQR, 5000);
    };

    updateQR();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [selectedClass]);

  const generateQR = async (classId: number) => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    try {
      const data = {
        classId,
        timestamp: new Date().toISOString(),
        nonce: Math.random().toString(36).substring(2),
      };

      await QRCode.toCanvas(canvasRef.current, JSON.stringify(data), {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'L',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        version: 4 // Force smaller version for faster generation
      });
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select
        value={selectedClass}
        onValueChange={(value) => {
          setSelectedClass(value);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a class" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((class_) => (
            <SelectItem key={class_.id} value={class_.id.toString()}>
              {class_.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex justify-center relative min-h-[200px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        <canvas ref={canvasRef} />
      </div>

      {selectedClass && (
        <p className="text-sm text-muted-foreground text-center">
          QR code updates every 5 seconds
        </p>
      )}
    </div>
  );
}