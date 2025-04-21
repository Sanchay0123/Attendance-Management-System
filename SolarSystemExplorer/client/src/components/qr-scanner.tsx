import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const QR_VALIDITY_SECONDS = 8; // Slightly longer than update interval to ensure smooth scanning

export default function QRScanner() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { toast } = useToast();

  const attendanceMutation = useMutation({
    mutationFn: async (classId: number) => {
      const res = await apiRequest("POST", "/api/attendance", { classId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/student"] });
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const processQrCode = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      const qrTimestamp = new Date(data.timestamp);
      const now = new Date();
      const differenceInSeconds = (now.getTime() - qrTimestamp.getTime()) / 1000;

      if (differenceInSeconds > QR_VALIDITY_SECONDS) {
        toast({
          title: "Invalid QR Code",
          description: "This QR code has expired. Please scan a new one.",
          variant: "destructive",
        });
        return;
      }

      if (data.classId) {
        attendanceMutation.mutate(data.classId);
      }
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not valid for attendance",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current.render(processQrCode, console.error);

    return () => {
      scannerRef.current?.clear();
    };
  }, []);

  return (
    <Card className="p-4">
      <div id="qr-reader" className="w-full max-w-sm mx-auto" />
      <div className="mt-4 text-center">
        <Button
          variant="outline"
          onClick={() => {
            scannerRef.current?.clear();
            scannerRef.current?.render(processQrCode, console.error);
          }}
        >
          Restart Scanner
        </Button>
      </div>
    </Card>
  );
}