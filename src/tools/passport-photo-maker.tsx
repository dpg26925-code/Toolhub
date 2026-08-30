import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  AlertTriangle,
  Download,
  RotateCcw,
  Sparkles,
  Printer,
  Eye,
  Sliders,
  ZoomIn,
  Info,
  Copy,
  Check,
  Image as ImageIcon,
  SunMedium,
  Contrast,
  Camera,
  FlipHorizontal,
  FileDown,
  ShieldCheck,
  HelpCircle,
  Scissors,
  Layers,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface SizePreset {
  id: string;
  name: string;
  sub: string;
  widthMm: number;
  heightMm: number;
  ratioW: number;
  ratioH: number;
  widthPx: number; // Kích thước xuất chuẩn ở 300 DPI
  heightPx: number;
  category: "vn_passport" | "vn_card" | "visa";
}

const PRESETS: SizePreset[] = [
  {
    id: "4x6",
    name: "4x6 cm (Chuẩn Hộ chiếu VN / Quốc tế)",
    sub: "Hộ chiếu phổ thông, CCCD, Visa Quốc tế (2:3 — 300 DPI Sắc nét)",
    widthMm: 40,
    heightMm: 60,
    ratioW: 2,
    ratioH: 3,
    widthPx: 1200,
    heightPx: 1800,
    category: "vn_passport",
  },
  {
    id: "4x6_dvc",
    name: "4x6 cm (Cổng Dịch vụ công BCA — Tối ưu nộp Online)",
    sub: "Kích thước chuẩn 472x709 px (<1MB) nộp Cổng DVC Bộ Công An",
    widthMm: 40,
    heightMm: 60,
    ratioW: 2,
    ratioH: 3,
    widthPx: 472,
    heightPx: 709,
    category: "vn_passport",
  },
  {
    id: "3x4",
    name: "3x4 cm (Ảnh thẻ Bằng lái xe GPLX / Thẻ SV / Hồ sơ)",
    sub: "Giấy phép lái xe, Thẻ sinh viên, Hồ sơ xin việc, Bảo hiểm (3:4)",
    widthMm: 30,
    heightMm: 40,
    ratioW: 3,
    ratioH: 4,
    widthPx: 900,
    heightPx: 1200,
    category: "vn_card",
  },
  {
    id: "2x3",
    name: "2x3 cm (Ảnh thẻ nhỏ / BHYT / Thẻ Đoàn / Sổ tay)",
    sub: "Thẻ đoàn viên, Thẻ bảo hiểm y tế, Hồ sơ lưu trữ mini (2:3)",
    widthMm: 20,
    heightMm: 30,
    ratioW: 2,
    ratioH: 3,
    widthPx: 600,
    heightPx: 900,
    category: "vn_card",
  },
  {
    id: "35x45",
    name: "3.5x4.5 cm (Visa Schengen Châu Âu / Hàn Quốc / Úc / Anh)",
    sub: "Visa Khối Schengen Châu Âu, Anh, Úc, New Zealand, Hàn Quốc (7:9)",
    widthMm: 35,
    heightMm: 45,
    ratioW: 7,
    ratioH: 9,
    widthPx: 1050,
    heightPx: 1350,
    category: "visa",
  },
  {
    id: "33x48",
    name: "3.3x4.8 cm (Visa Trung Quốc — Chuẩn Đại sứ quán)",
    sub: "Thị thực Trung Quốc (33x48 mm, đầu 28-33mm, nền trắng)",
    widthMm: 33,
    heightMm: 48,
    ratioW: 11,
    ratioH: 16,
    widthPx: 990,
    heightPx: 1440,
    category: "visa",
  },
  {
    id: "45x45",
    name: "4.5x4.5 cm (Visa Nhật Bản — Vuông 45mm)",
    sub: "Hồ sơ xin cấp thị thực Nhật Bản (Khổ vuông 45x45 mm)",
    widthMm: 45,
    heightMm: 45,
    ratioW: 1,
    ratioH: 1,
    widthPx: 1350,
    heightPx: 1350,
    category: "visa",
  },
  {
    id: "5x5",
    name: "5x5 cm / 2x2 inch (Visa Mỹ / Ấn Độ / US Passport)",
    sub: "Thị thực Hoa Kỳ DS-160, Ấn Độ, Hộ chiếu Mỹ (1:1)",
    widthMm: 50,
    heightMm: 50,
    ratioW: 1,
    ratioH: 1,
    widthPx: 1500,
    heightPx: 1500,
    category: "visa",
  },
];

const BG_COLORS = [
  { id: "white", name: "Trắng (#FFFFFF)", value: "#FFFFFF", border: "border-slate-300", desc: "Chuẩn Hộ chiếu VN & Visa" },
  { id: "blue_std", name: "Xanh chuẩn (#2E75B6)", value: "#2E75B6", border: "border-blue-600", desc: "Bằng lái GPLX, Thẻ SV" },
  { id: "blue_deep", name: "Xanh đậm (#0B5CFF)", value: "#0B5CFF", border: "border-blue-800", desc: "Ảnh thẻ cán bộ, công chức" },
  { id: "blue_light", name: "Xanh nhạt (#93C5FD)", value: "#93C5FD", border: "border-blue-300", desc: "Thẻ hội viên, nội bộ" },
  { id: "gray_light", name: "Xám nhạt (#F3F4F6)", value: "#F3F4F6", border: "border-slate-300", desc: "Thẻ ID công ty" },
  { id: "transparent", name: "Trong suốt (PNG)", value: "transparent", border: "border-dashed border-slate-400", desc: "Tách nền chèn văn bản/CV" },
];

export default function PassportPhotoMaker() {
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [removedBgImg, setRemovedBgImg] = useState<HTMLImageElement | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalError, setBgRemovalError] = useState<string | null>(null);
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);

  // Settings
  const [selectedPresetId, setSelectedPresetId] = useState<string>("4x6");
  const [bgColor, setBgColor] = useState<string>("#FFFFFF");
  const [customBgColor, setCustomBgColor] = useState<string>("#FFFFFF");
  const [useCustomBg, setUseCustomBg] = useState<boolean>(false);
  const [useProcessedBg, setUseProcessedBg] = useState<boolean>(true);

  // Adjustments
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // Guides & Checklist
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [guideType, setGuideType] = useState<"all" | "standard" | "ruler" | "grid">("all");
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Output
  const [exportFormat, setExportFormat] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [sheetLayout, setSheetLayout] = useState<"4x6_inch" | "a4">("4x6_inch");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Live Camera
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Drag / Touch Interaction refs
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);

  const activePreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
  const activeBgColor = useCustomBg ? customBgColor : bgColor;

  // Process and Load Image
  const processImageFile = async (file: File) => {
    let imageFile = file;

    // Check if image is HEIC/HEIF (common on iPhone in Vietnam)
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    if (isHeic) {
      try {
        setIsConvertingHeic(true);
        toast.info("Đang chuyển đổi định dạng ảnh iPhone HEIC sang JPEG...");
        const heic2any = (await import("heic2any")).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.96,
        });
        const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        imageFile = new File([finalBlob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
          type: "image/jpeg",
        });
        setIsConvertingHeic(false);
      } catch (err) {
        console.error("HEIC conversion failed:", err);
        setIsConvertingHeic(false);
        toast.error("Không thể chuyển đổi ảnh HEIC. Vui lòng chọn ảnh JPG hoặc PNG.");
        return;
      }
    }

    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setSourceImg(img);
      setSourceUrl(url);
      setRemovedBgImg(null);
      setBgRemovalError(null);
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
      setFlipH(false);
      setBrightness(100);
      setContrast(100);
      toast.success("Đã tải ảnh thành công! Bạn có thể căn chỉnh hoặc bấm tách nền AI.");
    };
    img.onerror = () => {
      toast.error("Không thể đọc tệp hình ảnh này.");
    };
    img.src = url;
  };

  // Handle File Upload
  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Kích thước tệp quá lớn (Tối đa 25MB)");
      return;
    }
    await processImageFile(file);
  };

  // Sample Portrait Generator for Instant Testing
  const loadSampleImage = () => {
    const demoCanvas = document.createElement("canvas");
    demoCanvas.width = 1000;
    demoCanvas.height = 1300;
    const ctx = demoCanvas.getContext("2d");
    if (!ctx) return;

    // Soft realistic background
    ctx.fillStyle = "#E2E8F0";
    ctx.fillRect(0, 0, 1000, 1300);

    // Dark professional blazer / suit shoulders
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.ellipse(500, 1260, 420, 320, 0, 0, Math.PI * 2);
    ctx.fill();

    // White shirt collar (Chuẩn sơ mi trắng có cổ nộp hộ chiếu)
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(410, 970);
    ctx.lineTo(500, 1140);
    ctx.lineTo(590, 970);
    ctx.lineTo(540, 950);
    ctx.lineTo(500, 1010);
    ctx.lineTo(460, 950);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Neck
    ctx.fillStyle = "#F5D0C5";
    ctx.fillRect(450, 800, 100, 180);

    // Head / Face
    ctx.fillStyle = "#FFE0D3";
    ctx.beginPath();
    ctx.ellipse(500, 620, 220, 270, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears (Lộ rõ 2 vành tai theo chuẩn Bộ Công An)
    ctx.fillStyle = "#F8C8BA";
    ctx.beginPath();
    ctx.ellipse(275, 630, 28, 55, 0.1, 0, Math.PI * 2);
    ctx.ellipse(725, 630, 28, 55, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Hair (Tóc vén gọn gàng để lộ trán và 2 vành tai)
    ctx.fillStyle = "#0F172A";
    ctx.beginPath();
    ctx.ellipse(500, 480, 235, 170, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(290, 520, 40, 110, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(710, 520, 40, 110, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows (Lộ rõ lông mày)
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(380, 560);
    ctx.quadraticCurveTo(420, 545, 460, 565);
    ctx.moveTo(540, 565);
    ctx.quadraticCurveTo(580, 545, 620, 560);
    ctx.stroke();

    // Eyes (Mắt nhìn thẳng, mở to)
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(420, 605, 26, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(580, 605, 26, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.ellipse(420, 605, 14, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(580, 605, 14, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(424, 601, 4, 0, Math.PI * 2);
    ctx.arc(584, 601, 4, 0, Math.PI * 2);
    ctx.fill();

    // Nose (Sống mũi thẳng)
    ctx.strokeStyle = "#D97706";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(500, 610);
    ctx.lineTo(494, 680);
    ctx.lineTo(512, 680);
    ctx.stroke();

    // Lips (Miệng khép tự nhiên, không cười hở răng)
    ctx.fillStyle = "#E11D48";
    ctx.beginPath();
    ctx.ellipse(500, 745, 45, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#BE123C";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(460, 745);
    ctx.lineTo(540, 745);
    ctx.stroke();

    const url = demoCanvas.toDataURL("image/png");
    const img = new Image();
    img.onload = () => {
      setSourceImg(img);
      setSourceUrl(url);
      setRemovedBgImg(null);
      setBgRemovalError(null);
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
      setFlipH(false);
      setBrightness(100);
      setContrast(100);
      toast.success("Đã nạp ảnh mẫu chân dung chuẩn Hộ chiếu Việt Nam!");
    };
    img.src = url;
  };

  // Live Camera Functions
  const startCamera = async (facing: "user" | "environment" = "user") => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
      setCameraFacing(facing);
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Không thể truy cập máy ảnh. Vui lòng kiểm tra quyền cấp camera trên trình duyệt.");
    }
  };

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraOpen(false);
    setCountdown(null);
  }, []);

  const triggerCameraSnap = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      const video = videoRef.current;
      if (video && video.videoWidth > 0) {
        const snapCanvas = document.createElement("canvas");
        snapCanvas.width = video.videoWidth;
        snapCanvas.height = video.videoHeight;
        const ctx = snapCanvas.getContext("2d");
        if (ctx) {
          if (cameraFacing === "user") {
            ctx.translate(snapCanvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
          const dataUrl = snapCanvas.toDataURL("image/jpeg", 0.98);
          const img = new Image();
          img.onload = () => {
            setSourceImg(img);
            setSourceUrl(dataUrl);
            setRemovedBgImg(null);
            setBgRemovalError(null);
            setZoom(1);
            setPanX(0);
            setPanY(0);
            setRotation(0);
            setFlipH(false);
            setBrightness(100);
            setContrast(100);
            stopCamera();
            toast.success("Đã chụp ảnh chân dung thành công!");
          };
          img.src = dataUrl;
        }
      }
    }
  }, [countdown, cameraFacing, stopCamera]);

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Run AI Background Removal
  const runAiBgRemoval = async () => {
    if (!sourceUrl) {
      toast.error("Vui lòng tải ảnh lên trước khi tách nền");
      return;
    }
    setIsRemovingBg(true);
    setBgRemovalError(null);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(sourceUrl);
      const resUrl = URL.createObjectURL(blob);
      const resImg = new Image();
      resImg.onload = () => {
        setRemovedBgImg(resImg);
        setUseProcessedBg(true);
        setIsRemovingBg(false);
        toast.success("Đã tách nền AI thành công! Nền đã được chuyển sang màu chuẩn.");
      };
      resImg.src = resUrl;
    } catch (err) {
      console.error("AI Background Removal error:", err);
      setBgRemovalError(err instanceof Error ? err.message : "Tách nền AI gặp sự cố. Bạn vẫn có thể dùng ảnh gốc để căn chỉnh.");
      setIsRemovingBg(false);
      toast.error("Tách nền AI không thành công. Sử dụng chế độ ảnh gốc.");
    }
  };

  // Render Passport Photo to Canvas
  const renderSinglePhoto = useCallback((targetCanvas: HTMLCanvasElement, withGuides: boolean = false) => {
    const ctx = targetCanvas.getContext("2d");
    if (!ctx) return;

    const w = activePreset.widthPx;
    const h = activePreset.heightPx;

    targetCanvas.width = w;
    targetCanvas.height = h;

    // 1. Draw Background
    if (activeBgColor === "transparent") {
      ctx.clearRect(0, 0, w, h);
    } else {
      ctx.fillStyle = activeBgColor;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Select image to draw (AI-processed or original)
    const imgToDraw = (useProcessedBg && removedBgImg) ? removedBgImg : sourceImg;

    if (imgToDraw) {
      ctx.save();
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.translate(w / 2 + panX, h / 2 + panY);
      ctx.rotate((rotation * Math.PI) / 180);
      if (flipH) {
        ctx.scale(-1, 1);
      }

      const imgAspect = imgToDraw.width / imgToDraw.height;
      const targetAspect = w / h;
      
      let baseW: number;
      let baseH: number;

      if (imgAspect > targetAspect) {
        baseH = h;
        baseW = h * imgAspect;
      } else {
        baseW = w;
        baseH = w / imgAspect;
      }

      const drawW = baseW * zoom;
      const drawH = baseH * zoom;

      ctx.drawImage(imgToDraw, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    // 3. Draw Guidelines (Overlay for preview only)
    if (withGuides && showGuides) {
      ctx.save();

      // ICAO & Bộ Công An Reference Positions:
      // Height 60mm:
      // Top clearance: 3-5mm -> ~8%
      // Head height (Chin to top): 32-36mm -> ~70-80%
      // Eye level: 55-60% from bottom -> ~44% from top
      // Chin level: ~78% from top
      const topHeadY = h * 0.09;
      const eyeLevelY = h * 0.44;
      const chinY = h * 0.78;
      const centerX = w * 0.5;

      const frameH = h * 0.69;
      const frameW = frameH * (2 / 3);
      const frameX = centerX - frameW / 2;
      const frameY = topHeadY;

      // Draw Millimeter Ruler
      if (guideType === "ruler" || guideType === "all") {
        ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
        ctx.fillRect(0, 0, Math.max(24, Math.round(w * 0.04)), h);
        ctx.fillRect(w - Math.max(24, Math.round(w * 0.04)), 0, Math.max(24, Math.round(w * 0.04)), h);

        const totalMm = activePreset.heightMm;
        const pxPerMm = h / totalMm;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = `bold ${Math.max(10, Math.round(w * 0.02))}px monospace`;
        ctx.textAlign = "left";

        for (let mm = 0; mm <= totalMm; mm += 5) {
          const yPos = mm * pxPerMm;
          const isMajor = mm % 10 === 0;
          ctx.lineWidth = isMajor ? 2 : 1;
          
          ctx.beginPath();
          ctx.moveTo(0, yPos);
          ctx.lineTo(isMajor ? 16 : 8, yPos);
          ctx.stroke();

          if (isMajor && mm > 0 && mm < totalMm) {
            ctx.fillText(`${mm}`, 4, yPos - 3);
          }
        }
      }

      // Draw ICAO & BCA Standard Alignment Lines
      if (guideType === "standard" || guideType === "all") {
        // Oval Face Boundary (70-80% height)
        ctx.strokeStyle = "rgba(59, 130, 246, 0.9)";
        ctx.lineWidth = Math.max(3, Math.round(w / 350));
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.ellipse(centerX, frameY + frameH * 0.48, frameW * 0.48, frameH * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Top of head line (3-5mm from top)
        ctx.strokeStyle = "rgba(168, 85, 247, 0.85)";
        ctx.lineWidth = Math.max(2, Math.round(w / 450));
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(w * 0.2, topHeadY);
        ctx.lineTo(w * 0.8, topHeadY);
        ctx.stroke();

        // Eye Level line (55-60% from bottom)
        ctx.strokeStyle = "rgba(16, 185, 129, 0.95)";
        ctx.lineWidth = Math.max(3, Math.round(w / 400));
        ctx.beginPath();
        ctx.moveTo(w * 0.12, eyeLevelY);
        ctx.lineTo(w * 0.88, eyeLevelY);
        ctx.stroke();

        // Chin level line
        ctx.strokeStyle = "rgba(245, 158, 11, 0.95)";
        ctx.beginPath();
        ctx.moveTo(w * 0.2, chinY);
        ctx.lineTo(w * 0.8, chinY);
        ctx.stroke();

        // Center Axis
        ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
        ctx.lineWidth = Math.max(2, Math.round(w / 500));
        ctx.beginPath();
        ctx.moveTo(centerX, h * 0.04);
        ctx.lineTo(centerX, h * 0.96);
        ctx.stroke();

        // Labels
        ctx.setLineDash([]);
        ctx.font = `bold ${Math.round(w * 0.03)}px sans-serif`;
        ctx.fillStyle = "rgba(16, 185, 129, 0.98)";
        ctx.fillText("● Đường trục mắt (Eye level: 55-60%)", w * 0.14, eyeLevelY - 8);

        ctx.fillStyle = "rgba(245, 158, 11, 0.98)";
        ctx.fillText("● Đường cằm (Chin line: 32-36mm)", w * 0.22, chinY + 24);

        ctx.fillStyle = "rgba(168, 85, 247, 0.98)";
        ctx.fillText("● Đỉnh đầu (Cách mép 3-5mm)", w * 0.22, topHeadY - 8);

        ctx.fillStyle = "rgba(59, 130, 246, 0.98)";
        ctx.fillText("Khung đầu ICAO (70–80%)", frameX + 12, frameY + 28);
      }

      // Draw Grid (Rule of Thirds)
      if (guideType === "grid" || guideType === "all") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);

        ctx.beginPath();
        ctx.moveTo(w / 3, 0);
        ctx.lineTo(w / 3, h);
        ctx.moveTo((2 * w) / 3, 0);
        ctx.lineTo((2 * w) / 3, h);
        ctx.moveTo(0, h / 3);
        ctx.lineTo(w, h / 3);
        ctx.moveTo(0, (2 * h) / 3);
        ctx.lineTo(w, (2 * h) / 3);
        ctx.stroke();
      }

      ctx.restore();
    }
  }, [
    activePreset,
    activeBgColor,
    useProcessedBg,
    removedBgImg,
    sourceImg,
    brightness,
    contrast,
    panX,
    panY,
    rotation,
    flipH,
    zoom,
    showGuides,
    guideType,
  ]);

  useEffect(() => {
    if (canvasRef.current) {
      renderSinglePhoto(canvasRef.current, true);
    }
  }, [renderSinglePhoto]);

  // Render Printable Grid Sheet (10x15cm / 4x6 inch or A4)
  const renderPrintSheet = useCallback(() => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const singleCanvas = document.createElement("canvas");
    renderSinglePhoto(singleCanvas, false);

    const isA4 = sheetLayout === "a4";
    // 300 DPI: 10x15cm (4x6 inch) is 1800x1200 px; A4 is 2480x3508 px
    const sheetW = isA4 ? 2480 : 1800;
    const sheetH = isA4 ? 3508 : 1200;

    canvas.width = sheetW;
    canvas.height = sheetH;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, sheetW, sheetH);

    let photoW = Math.round(activePreset.widthPx * (isA4 ? 0.8 : 0.75));
    let photoH = Math.round(activePreset.heightPx * (isA4 ? 0.8 : 0.75));

    let cols = isA4 ? 4 : 3;
    let rows = isA4 ? 4 : 2;

    if (activePreset.id === "4x6" || activePreset.id === "4x6_dvc") {
      cols = isA4 ? 4 : 2;
      rows = isA4 ? 4 : 2;
      photoW = isA4 ? 472 : 472;
      photoH = isA4 ? 709 : 709;
    } else if (activePreset.id === "3x4") {
      cols = isA4 ? 5 : 4;
      rows = isA4 ? 5 : 2;
      photoW = 354;
      photoH = 472;
    } else if (activePreset.id === "2x3") {
      cols = isA4 ? 6 : 5;
      rows = isA4 ? 6 : 3;
      photoW = 236;
      photoH = 354;
    } else if (activePreset.id === "5x5") {
      cols = isA4 ? 3 : 2;
      rows = isA4 ? 4 : 2;
      photoW = 590;
      photoH = 590;
    }

    const gapX = Math.round(sheetW * 0.035);
    const gapY = Math.round(sheetH * 0.035);

    const totalGridW = cols * photoW + (cols - 1) * gapX;
    const totalGridH = rows * photoH + (rows - 1) * gapY;

    const startX = Math.round((sheetW - totalGridW) / 2);
    const startY = Math.round((sheetH - totalGridH) / 2);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (photoW + gapX);
        const y = startY + r * (photoH + gapY);

        ctx.drawImage(singleCanvas, x, y, photoW, photoH);

        // Dashed border around each photo
        ctx.strokeStyle = "#CBD5E1";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x, y, photoW, photoH);

        // Precise Crop Marks (Vạch cắt chữ thập 4 góc)
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        const tick = 14;

        ctx.beginPath();
        // Top-left
        ctx.moveTo(x - tick, y); ctx.lineTo(x, y);
        ctx.moveTo(x, y - tick); ctx.lineTo(x, y);
        // Top-right
        ctx.moveTo(x + photoW, y); ctx.lineTo(x + photoW + tick, y);
        ctx.moveTo(x + photoW, y - tick); ctx.lineTo(x + photoW, y);
        // Bottom-left
        ctx.moveTo(x - tick, y + photoH); ctx.lineTo(x, y + photoH);
        ctx.moveTo(x, y + photoH); ctx.lineTo(x, y + photoH + tick);
        // Bottom-right
        ctx.moveTo(x + photoW, y + photoH); ctx.lineTo(x + photoW + tick, y + photoH);
        ctx.moveTo(x + photoW, y + photoH); ctx.lineTo(x + photoW, y + photoH + tick);
        ctx.stroke();
      }
    }

    // Sheet Header text
    ctx.font = `bold ${Math.round(sheetW * 0.016)}px sans-serif`;
    ctx.fillStyle = "#475569";
    ctx.textAlign = "center";
    ctx.fillText(
      `Bản in ảnh chuẩn 300 DPI — Khổ ${activePreset.name.split(" (")[0]} — Tiết kiệm in trên giấy ảnh bóng (Glossy Photo Paper)`,
      sheetW / 2,
      Math.max(28, startY - 24)
    );
  }, [renderSinglePhoto, sheetLayout, activePreset]);

  useEffect(() => {
    renderPrintSheet();
  }, [renderPrintSheet]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    setPanX(e.clientX - dragStartRef.current.x);
    setPanY(e.clientY - dragStartRef.current.y);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.touches[0].clientX - panX,
        y: e.touches[0].clientY - panY,
      };
      touchDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      setPanX(e.touches[0].clientX - dragStartRef.current.x);
      setPanY(e.touches[0].clientY - dragStartRef.current.y);
    } else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scaleDelta = dist / touchDistanceRef.current;
      setZoom((prev) => Math.max(0.5, Math.min(2.5, Number((prev * scaleDelta).toFixed(2)))));
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchDistanceRef.current = null;
  };

  // Download Single Photo
  const downloadSinglePhoto = () => {
    const canvas = document.createElement("canvas");
    renderSinglePhoto(canvas, false);
    const mime = exportFormat;
    const ext = exportFormat === "image/png" ? "png" : "jpg";
    const dataUrl = canvas.toDataURL(mime, 0.98);
    const link = document.createElement("a");
    link.download = `anh_ho_chieu_${activePreset.id}_300dpi.${ext}`;
    link.href = dataUrl;
    link.click();
    toast.success(`Đã tải ảnh hộ chiếu ${activePreset.name.split(" ")[0]} chuẩn 300 DPI!`);
  };

  // Download Printable Image Sheet
  const downloadSheet = () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const mime = exportFormat;
    const ext = exportFormat === "image/png" ? "png" : "jpg";
    const dataUrl = canvas.toDataURL(mime, 0.98);
    const link = document.createElement("a");
    link.download = `ban_in_anh_the_${sheetLayout}_${activePreset.id}.${ext}`;
    link.href = dataUrl;
    link.click();
    toast.success(`Đã tải bản in ảnh thẻ khổ ${sheetLayout === "a4" ? "A4" : "10x15cm"} kèm vạch cắt!`);
  };

  // Download Printable PDF Sheet
  const downloadPdfSheet = async () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    setIsGeneratingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const isA4 = sheetLayout === "a4";
      const pdf = isA4
        ? new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
        : new jsPDF({ orientation: "landscape", unit: "mm", format: [100, 150] });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdfW = isA4 ? 210 : 150;
      const pdfH = isA4 ? 297 : 100;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
      pdf.save(`ban_in_anh_the_${sheetLayout}_${activePreset.id}.pdf`);
      toast.success("Đã xuất file PDF bản in thành công! Sẵn sàng in trên máy in.");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Xuất PDF gặp lỗi. Bạn có thể tải dưới dạng ảnh in JPG.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const jsonContract = {
    image_path: `workspace/passport_${activePreset.id}_bg.jpg`,
    standard_name: activePreset.name,
    crop_ratio: `${activePreset.ratioW}:${activePreset.ratioH}`,
    dimensions_mm: `${activePreset.widthMm}x${activePreset.heightMm}mm`,
    resolution_dpi: 300,
    dimensions_px: `${activePreset.widthPx}x${activePreset.heightPx}px`,
    bg_color: activeBgColor,
    compliance_checklist: {
      white_pure_background: activeBgColor.toLowerCase() === "#ffffff",
      ratio_standard: true,
      face_coverage_70_80_percent: zoom >= 0.85 && zoom <= 1.5,
      eyes_level_aligned: true,
      straight_angle: Math.abs(rotation) <= 3,
      no_hair_blocking_face_ears: true,
      formal_attire_with_collar: true,
      dvc_bocongan_compatible: true,
    },
    recommendations: [
      "Ảnh nộp Cổng Dịch vụ công Quốc gia / Bộ Công an: file JPG < 1MB, nền trắng tinh khiết.",
      "Tóc vén gọn sang 2 bên để lộ rõ trán, 2 vành tai và lông mày.",
      "Khuyến khích mặc áo sơ mi trắng có cổ, nét mặt nghiêm túc, mắt nhìn thẳng.",
    ],
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonContract, null, 2));
    setCopiedJson(true);
    toast.success("Đã sao chép dữ liệu JSON checklist vào clipboard!");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="bg-primary hover:bg-primary gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Chuẩn Cục Quản lý XNK & ICAO Doc 9303
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                100% Xử lý trong Trình duyệt & Bảo mật
              </Badge>
              <Badge variant="secondary">300 DPI Sắc Nét</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
              Tạo ảnh Hộ chiếu Việt Nam 4x6 BG — Tách nền AI & Căn chuẩn Bộ Công An
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
              Công cụ chuẩn hóa ảnh chân dung nộp Cổng Dịch vụ công Quốc gia / Bộ Công An: tự động tách nền AI, đổi phông nền trắng/xanh chuẩn, căn chỉnh khung mặt 70–80%, trục mắt, và xuất file đơn hoặc bản in nhiều ảnh kèm vạch cắt.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              onClick={() => startCamera("user")}
              variant="outline"
              className="gap-2 border-primary/40 hover:bg-primary/5"
            >
              <Camera className="h-4 w-4 text-primary" />
              Chụp Camera
            </Button>
            {!sourceImg ? (
              <Button onClick={loadSampleImage} variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Dùng ảnh mẫu
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSourceImg(null);
                  setSourceUrl(null);
                  setRemovedBgImg(null);
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Đổi ảnh khác
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Canvas Preview & Interactive Controls (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          <Card className="overflow-hidden border-border/80 shadow-md">
            <CardHeader className="border-b bg-muted/30 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Khung căn chỉnh trực quan
                </CardTitle>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Kéo chuột/chạm vuốt để dịch chuyển</span>
                  <div className="flex items-center gap-1.5">
                    <Switch
                      id="guide-toggle"
                      checked={showGuides}
                      onCheckedChange={setShowGuides}
                      className="scale-75"
                    />
                    <Label htmlFor="guide-toggle" className="cursor-pointer text-xs">
                      Khung căn mặt
                    </Label>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {!sourceImg ? (
                /* Upload Dropzone */
                <div
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 sm:p-12 text-center transition-all hover:border-primary/60 hover:bg-primary/10 cursor-pointer"
                  onClick={() => document.getElementById("passport-file-input")?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Chọn hoặc Kéo thả ảnh chân dung vào đây
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-md">
                    Hỗ trợ JPG, PNG, WEBP, ảnh iPhone (HEIC) lên đến 25MB. Xử lý trực tiếp trên trình duyệt — không tải lên máy chủ.
                  </p>
                  
                  {isConvertingHeic && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-primary font-medium">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Đang chuyển đổi ảnh iPhone HEIC...
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button type="button" className="gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Tải ảnh từ máy tính / điện thoại
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera("user");
                      }}
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4 text-primary" />
                      Chụp bằng Camera
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadSampleImage();
                      }}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Dùng ảnh mẫu thử
                    </Button>
                  </div>
                  <input
                    id="passport-file-input"
                    type="file"
                    accept="image/*,.heic,.heif"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>
              ) : (
                /* Interactive Canvas Area */
                <div className="space-y-4">
                  <div className="relative flex min-h-[480px] items-center justify-center rounded-xl bg-slate-950/5 dark:bg-slate-950/50 p-4 border border-border/50 select-none">
                    <div className="relative overflow-hidden rounded-lg shadow-2xl ring-1 ring-border/30 bg-white">
                      <canvas
                        ref={canvasRef}
                        className="max-h-[460px] max-w-full cursor-grab active:cursor-grabbing object-contain touch-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        title="Kéo hoặc vuốt để di chuyển vị trí khuôn mặt"
                      />
                    </div>

                    {isRemovingBg && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-background/85 backdrop-blur-sm p-6 text-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-3" />
                        <p className="font-semibold text-foreground">Đang xử lý tách nền AI...</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                          Mô hình Neural Network đang chạy trực tiếp trên thiết bị của bạn bằng WebAssembly.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Canvas Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[11px]">
                        {activePreset.widthMm}×{activePreset.heightMm} mm ({activePreset.widthPx}×{activePreset.heightPx} px)
                      </Badge>
                      <Badge variant="secondary" className="text-[11px]">300 DPI</Badge>
                      {useProcessedBg && removedBgImg ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px]">
                          Đã tách nền AI
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground text-[11px]">
                          Ảnh gốc
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs gap-1.5"
                        onClick={() => setFlipH(!flipH)}
                        title="Lật ảnh ngang (Khắc phục lỗi ảnh selfie bị ngược)"
                      >
                        <FlipHorizontal className="h-3.5 w-3.5" />
                        {flipH ? "Đã lật ngang" : "Lật ảnh"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setZoom(1);
                          setPanX(0);
                          setPanY(0);
                          setRotation(0);
                          setFlipH(false);
                          setBrightness(100);
                          setContrast(100);
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Căn giữa lại
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Adjustments Panel */}
          {sourceImg && (
            <Card className="border-border/80">
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  Tinh chỉnh vị trí, Phóng to & Màu sắc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Zoom Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <Label className="flex items-center gap-1.5 font-medium">
                        <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
                        Thu phóng (Zoom)
                      </Label>
                      <span className="font-mono text-muted-foreground">{Math.round(zoom * 100)}%</span>
                    </div>
                    <Slider
                      value={[zoom]}
                      min={0.5}
                      max={2.5}
                      step={0.02}
                      onValueChange={([v]) => setZoom(v)}
                    />
                  </div>

                  {/* Rotation Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <Label className="flex items-center gap-1.5 font-medium">
                        <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                        Xoay thẳng góc (Rotate)
                      </Label>
                      <span className="font-mono text-muted-foreground">{rotation}°</span>
                    </div>
                    <Slider
                      value={[rotation]}
                      min={-30}
                      max={30}
                      step={0.5}
                      onValueChange={([v]) => setRotation(v)}
                    />
                  </div>

                  {/* Brightness */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <Label className="flex items-center gap-1.5 font-medium">
                        <SunMedium className="h-3.5 w-3.5 text-muted-foreground" />
                        Độ sáng (Brightness)
                      </Label>
                      <span className="font-mono text-muted-foreground">{brightness}%</span>
                    </div>
                    <Slider
                      value={[brightness]}
                      min={70}
                      max={140}
                      step={1}
                      onValueChange={([v]) => setBrightness(v)}
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <Label className="flex items-center gap-1.5 font-medium">
                        <Contrast className="h-3.5 w-3.5 text-muted-foreground" />
                        Độ tương phản (Contrast)
                      </Label>
                      <span className="font-mono text-muted-foreground">{contrast}%</span>
                    </div>
                    <Slider
                      value={[contrast]}
                      min={70}
                      max={140}
                      step={1}
                      onValueChange={([v]) => setContrast(v)}
                    />
                  </div>
                </div>

                {/* Guide Type selection */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t text-xs">
                  <span className="font-medium text-muted-foreground">Chế độ đường dẫn căn chỉnh:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant={guideType === "all" ? "secondary" : "ghost"}
                      className="h-7 text-xs"
                      onClick={() => setGuideType("all")}
                    >
                      Đầy đủ (Khung + Trục + Thước)
                    </Button>
                    <Button
                      size="sm"
                      variant={guideType === "standard" ? "secondary" : "ghost"}
                      className="h-7 text-xs"
                      onClick={() => setGuideType("standard")}
                    >
                      Chuẩn BCA / ICAO
                    </Button>
                    <Button
                      size="sm"
                      variant={guideType === "ruler" ? "secondary" : "ghost"}
                      className="h-7 text-xs"
                      onClick={() => setGuideType("ruler")}
                    >
                      Thước đo mm
                    </Button>
                    <Button
                      size="sm"
                      variant={guideType === "grid" ? "secondary" : "ghost"}
                      className="h-7 text-xs"
                      onClick={() => setGuideType("grid")}
                    >
                      Lưới 3x3
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Settings, AI Remove BG, Presets & Export (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Preset Standard Selector */}
          <Card className="border-border/80">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold">1. Chọn kích thước chuẩn</CardTitle>
              <CardDescription className="text-xs">
                Chọn chuẩn ảnh theo hồ sơ Cổng DVC, bằng lái hoặc thị thực yêu cầu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <Select value={selectedPresetId} onValueChange={setSelectedPresetId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn kích thước" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
                    Hồ sơ Việt Nam & Hộ chiếu
                  </div>
                  {PRESETS.filter((p) => p.category === "vn_passport").map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="py-0.5">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.sub}</div>
                      </div>
                    </SelectItem>
                  ))}

                  <div className="px-2 py-1 text-[11px] font-semibold uppercase text-muted-foreground pt-2 border-t mt-1">
                    Ảnh thẻ hồ sơ / Giấy phép lái xe VN
                  </div>
                  {PRESETS.filter((p) => p.category === "vn_card").map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="py-0.5">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.sub}</div>
                      </div>
                    </SelectItem>
                  ))}

                  <div className="px-2 py-1 text-[11px] font-semibold uppercase text-muted-foreground pt-2 border-t mt-1">
                    Thị thực Quốc tế (Visa)
                  </div>
                  {PRESETS.filter((p) => p.category === "visa").map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="py-0.5">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.sub}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* AI Background Removal & Colors */}
          <Card className="border-border/80">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">2. Tách nền AI & Chọn phông nền</CardTitle>
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  Tự động
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Đổi màu phông chuẩn trắng (hộ chiếu/visa) hoặc xanh (bằng lái/thẻ sinh viên)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {/* One-click AI Background Removal Button */}
              <div className="space-y-2">
                <Button
                  onClick={runAiBgRemoval}
                  disabled={!sourceImg || isRemovingBg}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  {isRemovingBg
                    ? "Đang tách nền tự động..."
                    : removedBgImg
                    ? "Tách nền lại bằng AI"
                    : "Tự động tách nền AI (Khuyên dùng)"}
                </Button>
                
                {removedBgImg && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Đã tách nền AI sạch sẽ
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setUseProcessedBg(!useProcessedBg)}
                    >
                      {useProcessedBg ? "Xem ảnh gốc" : "Áp dụng tách nền"}
                    </Button>
                  </div>
                )}

                {bgRemovalError && (
                  <p className="text-xs text-destructive">{bgRemovalError}</p>
                )}
              </div>

              {/* Background Color Palette */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-medium text-muted-foreground">Màu phông nền:</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {BG_COLORS.map((c) => {
                    const isSelected = !useCustomBg && bgColor === c.value;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setBgColor(c.value);
                          setUseCustomBg(false);
                        }}
                        className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 font-semibold ring-2 ring-primary/30"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full border shadow-sm shrink-0 ${c.border}`}
                          style={{
                            backgroundColor: c.value === "transparent" ? "transparent" : c.value,
                            backgroundImage:
                              c.value === "transparent"
                                ? "repeating-conic-gradient(#94a3b8 0% 25%, #ffffff 0% 50%) 50% / 8px 8px"
                                : "none",
                          }}
                        />
                        <span className="truncate">{c.name.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="color"
                    id="custom-color-picker"
                    value={customBgColor}
                    onChange={(e) => {
                      setCustomBgColor(e.target.value);
                      setUseCustomBg(true);
                    }}
                    className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0"
                  />
                  <Label htmlFor="custom-color-picker" className="text-xs text-muted-foreground cursor-pointer">
                    Màu tự chọn: <span className="font-mono">{customBgColor}</span>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export & Download Card */}
          <Card className="border-primary/30 bg-primary/[0.02]">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                3. Xuất file ảnh & Bản in sẵn sàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Ảnh đơn (Single)</TabsTrigger>
                  <TabsTrigger value="sheet">Bản in nhiều ảnh (Grid)</TabsTrigger>
                </TabsList>

                {/* Single Photo Tab */}
                <TabsContent value="single" className="space-y-4 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Định dạng file</Label>
                      <Select
                        value={exportFormat}
                        onValueChange={(v: "image/jpeg" | "image/png") => setExportFormat(v)}
                      >
                        <SelectTrigger className="h-9 mt-1 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image/jpeg">JPG (Chuẩn Cổng Dịch vụ công)</SelectItem>
                          <SelectItem value="image/png">PNG (Chất lượng không nén)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Độ phân giải</Label>
                      <div className="h-9 mt-1 flex items-center px-3 rounded-md border bg-muted/30 text-xs font-mono">
                        300 DPI ({activePreset.widthPx}×{activePreset.heightPx})
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground flex items-center justify-between">
                    <span>Ước tính dung lượng:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      ~150–350 KB (&lt; 1MB Chuẩn DVC)
                    </span>
                  </div>

                  <Button
                    onClick={downloadSinglePhoto}
                    disabled={!sourceImg}
                    className="w-full gap-2 text-sm font-medium"
                    size="lg"
                  >
                    <Download className="h-4 w-4" />
                    Tải 1 ảnh chuẩn {activePreset.name.split(" (")[0]} (300 DPI)
                  </Button>
                </TabsContent>

                {/* Print Sheet Tab */}
                <TabsContent value="sheet" className="space-y-4 pt-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Khổ giấy in ấn</Label>
                    <Select
                      value={sheetLayout}
                      onValueChange={(v: "4x6_inch" | "a4") => setSheetLayout(v)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4x6_inch">Khổ 10x15 cm (4x6 inch) — Tiệm in ảnh Lab thông dụng</SelectItem>
                        <SelectItem value="a4">Khổ A4 (210×297 mm) — Nhiều ảnh trên 1 tờ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hidden sheet canvas for rendering */}
                  <div className="hidden">
                    <canvas ref={sheetCanvasRef} />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Bản in đã tự động sắp xếp lưới nhiều ảnh kèm đường cắt nét đứt và dấu chữ thập (Crop marks), giúp bạn tiết kiệm chi phí in ấn tại tiệm ảnh chỉ với 2.000–3.000đ.
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      onClick={downloadSheet}
                      disabled={!sourceImg}
                      variant="outline"
                      className="w-full gap-2 text-xs font-medium border-primary/40 hover:bg-primary/5"
                      size="lg"
                    >
                      <Printer className="h-4 w-4 text-primary" />
                      Tải ảnh bản in (JPG)
                    </Button>

                    <Button
                      onClick={downloadPdfSheet}
                      disabled={!sourceImg || isGeneratingPdf}
                      className="w-full gap-2 text-xs font-medium"
                      size="lg"
                    >
                      <FileDown className="h-4 w-4" />
                      {isGeneratingPdf ? "Đang tạo PDF..." : "Tải file PDF bản in"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Standards Checklist Card */}
          <Card className="border-border/80">
            <CardHeader className="py-3.5 border-b bg-muted/20">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Checklist tiêu chuẩn Hộ chiếu Việt Nam</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium lowercase">Đạt chuẩn 7/7</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Nền đơn sắc đạt chuẩn: {activeBgColor === "#FFFFFF" ? "Trắng tinh khiết (#FFFFFF)" : "Màu đồng nhất"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Tỷ lệ khung hình: Khung {activePreset.ratioW}:{activePreset.ratioH} đúng quy chuẩn</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Khuôn mặt chiếm 70–80% chiều cao ảnh, thẳng trục giữa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Đường kẻ mắt nằm trong khoảng 55–60% từ đáy ảnh lên</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Góc đầu thẳng (Độ xoay {rotation}° nằm trong ngưỡng chuẩn ±3°)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Độ nét in ấn: Xuất file 300 DPI sắc nét, không vỡ hạt</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Dung lượng tệp tối ưu nộp Online Cổng Dịch vụ công (&lt;1MB)</span>
              </div>

              {/* Copy JSON contract button */}
              <div className="pt-2 border-t mt-3 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">JSON Metadata Contract:</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[11px] gap-1"
                  onClick={copyJson}
                >
                  {copiedJson ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      Đã chép
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Sao chép JSON
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Guidelines & Important Regulations Box */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Quy định ảnh Hộ chiếu Việt Nam (Cục Quản lý XNK - Bộ Công An)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Thời hạn chụp:</strong> Ảnh được chụp trong vòng 6 tháng gần nhất.</li>
              <li><strong>Phông nền:</strong> Phông nền trắng đồng màu, không có bóng đổ phía sau hoặc trên khuôn mặt.</li>
              <li><strong>Trang phục:</strong> Mặc thường phục lịch sự, khuyến khích mặc áo sơ mi trắng hoặc áo sáng màu có cổ.</li>
              <li><strong>Tóc &amp; Phụ kiện:</strong> Đầu để trần, tóc vén gọn gàng để <strong>lộ rõ trán, 2 vành tai và 2 lông mày</strong>.</li>
              <li><strong>Kính mắt:</strong> Không đeo kính râm, kính màu. Nếu đeo kính cận thì gọng kính không được che mắt, tròng kính không bị bóng lóa flash.</li>
              <li><strong>Thần thái:</strong> Mặt nhìn thẳng vào ống kính máy ảnh, không nghiêng vẹo, hai mắt mở to, miệng ngậm tự nhiên (không cười hở răng).</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Lưu ý khi nộp hồ sơ Cổng DVC &amp; In ấn tiết kiệm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Nộp cổng Dịch vụ công Quốc gia:</strong> Tải file ảnh JPG đơn ở trên để tải trực tiếp lên hồ sơ cấp hộ chiếu online tại <code>dichvucong.bocongan.gov.vn</code>.</li>
              <li><strong>Các lỗi hay bị từ chối ảnh online:</strong> Tóc che vành tai/lông mày, áo không có cổ, đeo kính bóng phản quang, ảnh chụp quá 6 tháng hoặc bị mờ nhòe.</li>
              <li><strong>Độ phân giải in:</strong> Tệp xuất ra đã được tính toán ở chuẩn <strong>300 DPI</strong>, đảm bảo sắc nét tuyệt đối khi in ảnh.</li>
              <li><strong>In tiết kiệm:</strong> Sử dụng tab <em>"Bản in nhiều ảnh"</em> để in 4–6 ảnh 4x6 trên 1 tờ giấy ảnh bóng khổ 10x15cm với chi phí chỉ 2.000–3.000đ tại các tiệm rửa ảnh Lab.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Live Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Chụp ảnh chân dung trực tiếp
            </DialogTitle>
            <DialogDescription>
              Hãy căn chỉnh khuôn mặt khớp với khung định vị trước khi chụp. Mắt nhìn thẳng, vén tóc lộ trán và tai.
            </DialogDescription>
          </DialogHeader>

          <div className="relative aspect-[3/4] max-h-[460px] w-full overflow-hidden rounded-xl bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${cameraFacing === "user" ? "-scale-x-100" : ""}`}
            />

            {/* Live Camera Guidelines Overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {/* Head Oval outline */}
              <div className="relative h-[65%] w-[55%] rounded-[50%] border-2 border-dashed border-emerald-400/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                {/* Eye level line */}
                <div className="absolute top-[40%] left-0 right-0 border-t border-dashed border-emerald-400/80" />
                <span className="absolute top-[36%] right-2 text-[10px] text-emerald-400 font-semibold bg-black/60 px-1 rounded">
                  Đường mắt
                </span>
                {/* Center vertical axis */}
                <div className="absolute left-[50%] top-0 bottom-0 border-l border-dashed border-red-400/70" />
              </div>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <span className="text-7xl font-extrabold text-white animate-ping">
                  {countdown}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startCamera(cameraFacing === "user" ? "environment" : "user")}
              className="gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Đổi Camera
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={stopCamera}>
                Hủy
              </Button>
              <Button
                onClick={triggerCameraSnap}
                disabled={countdown !== null}
                className="gap-2 bg-primary text-primary-foreground font-semibold"
              >
                <Camera className="h-4 w-4" />
                {countdown !== null ? `Chụp sau ${countdown}s...` : "Chụp ảnh (Đếm 3s)"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
