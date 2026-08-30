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
  widthPx: number; // At 300 DPI
  heightPx: number;
}

const PRESETS: SizePreset[] = [
  {
    id: "4x6",
    name: "4x6 cm (Chuẩn Hộ chiếu VN / Quốc tế BG)",
    sub: "Hộ chiếu, CCCD, Visa Quốc tế (2:3)",
    widthMm: 40,
    heightMm: 60,
    ratioW: 2,
    ratioH: 3,
    widthPx: 1200,
    heightPx: 1800,
  },
  {
    id: "3x4",
    name: "3x4 cm (Ảnh thẻ hồ sơ / Bằng lái VN)",
    sub: "Bằng lái xe, Thẻ sinh viên, Hồ sơ xin việc (3:4)",
    widthMm: 30,
    heightMm: 40,
    ratioW: 3,
    ratioH: 4,
    widthPx: 900,
    heightPx: 1200,
  },
  {
    id: "35x45",
    name: "3.5x4.5 cm (Visa Châu Âu / Schengen / UK)",
    sub: "Visa Schengen, Anh, Úc, Canada, Nhật (7:9)",
    widthMm: 35,
    heightMm: 45,
    ratioW: 7,
    ratioH: 9,
    widthPx: 1050,
    heightPx: 1350,
  },
  {
    id: "5x5",
    name: "5x5 cm / 2x2 inch (Visa Mỹ / US Passport)",
    sub: "Thị thực Hoa Kỳ, Ấn Độ (1:1)",
    widthMm: 50,
    heightMm: 50,
    ratioW: 1,
    ratioH: 1,
    widthPx: 1500,
    heightPx: 1500,
  },
];

const BG_COLORS = [
  { id: "white", name: "Trắng (#FFFFFF)", value: "#FFFFFF", border: "border-slate-300" },
  { id: "blue_std", name: "Xanh chuẩn (#2E75B6)", value: "#2E75B6", border: "border-blue-600" },
  { id: "blue_deep", name: "Xanh đậm (#0B5CFF)", value: "#0B5CFF", border: "border-blue-800" },
  { id: "gray_light", name: "Xám nhạt (#F3F4F6)", value: "#F3F4F6", border: "border-slate-300" },
  { id: "transparent", name: "Trong suốt (PNG)", value: "transparent", border: "border-dashed border-slate-400" },
];

export default function PassportPhotoMaker() {
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [removedBgImg, setRemovedBgImg] = useState<HTMLImageElement | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalError, setBgRemovalError] = useState<string | null>(null);

  // Settings
  const [selectedPresetId, setSelectedPresetId] = useState<string>("4x6");
  const [bgColor, setBgColor] = useState<string>("#FFFFFF");
  const [customBgColor] = useState<string>("#FFFFFF");
  const [useCustomBg, setUseCustomBg] = useState<boolean>(false);
  const [useProcessedBg, setUseProcessedBg] = useState<boolean>(true);

  // Adjustments
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // Guides & Checklist
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [guideType, setGuideType] = useState<"standard" | "grid" | "all">("all");
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Output
  const [exportFormat, setExportFormat] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [exportQuality] = useState<number>(0.98);
  const [sheetLayout, setSheetLayout] = useState<"4x6_inch" | "a4">("4x6_inch");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activePreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
  const activeBgColor = useCustomBg ? customBgColor : bgColor;

  // Handle File Upload
  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Kích thước tệp quá lớn (Tối đa 20MB)");
      return;
    }

    const url = URL.createObjectURL(file);
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
      setBrightness(100);
      setContrast(100);
      toast.success("Đã tải ảnh thành công! Bạn có thể căn chỉnh hoặc bấm tách nền AI.");
    };
    img.onerror = () => {
      toast.error("Không thể đọc tệp hình ảnh này.");
    };
    img.src = url;
  };

  // Sample Portrait Generator for Instant Testing
  const loadSampleImage = () => {
    const demoCanvas = document.createElement("canvas");
    demoCanvas.width = 800;
    demoCanvas.height = 1000;
    const ctx = demoCanvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#E2E8F0";
    ctx.fillRect(0, 0, 800, 1000);

    // Body / Shoulders
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.ellipse(400, 950, 320, 250, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shirt collar
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(330, 750);
    ctx.lineTo(400, 880);
    ctx.lineTo(470, 750);
    ctx.lineTo(430, 730);
    ctx.lineTo(400, 780);
    ctx.lineTo(370, 730);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = "#FBCFE8";
    ctx.fillRect(360, 620, 80, 140);

    // Head / Face
    ctx.fillStyle = "#FDE2E4";
    ctx.beginPath();
    ctx.ellipse(400, 480, 170, 210, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = "#0F172A";
    ctx.beginPath();
    ctx.ellipse(400, 370, 185, 140, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(250, 420, 50, 100, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(550, 420, 50, 100, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#0F172A";
    ctx.beginPath();
    ctx.ellipse(335, 470, 14, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(465, 470, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(310, 440);
    ctx.quadraticCurveTo(340, 430, 365, 445);
    ctx.moveTo(435, 445);
    ctx.quadraticCurveTo(460, 430, 490, 440);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = "#E29578";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(400, 475);
    ctx.lineTo(395, 525);
    ctx.lineTo(410, 525);
    ctx.stroke();

    // Lips
    ctx.fillStyle = "#E11D48";
    ctx.beginPath();
    ctx.ellipse(400, 570, 35, 12, 0, 0, Math.PI * 2);
    ctx.fill();

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
      toast.success("Đã nạp ảnh mẫu chân dung thử nghiệm!");
    };
    img.src = url;
  };

  // Run AI Background Removal
  const runAiBgRemoval = async () => {
    if (!sourceUrl) {
      toast.error("Vui lòng tải ảnh lên trước");
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

      const topHeadY = h * 0.12;
      const eyeLevelY = h * 0.44;
      const chinY = h * 0.78;
      const centerX = w * 0.5;

      const frameH = h * 0.68;
      const frameW = frameH * (2 / 3);
      const frameX = centerX - frameW / 2;
      const frameY = topHeadY;

      if (guideType === "standard" || guideType === "all") {
        ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
        ctx.lineWidth = Math.max(3, Math.round(w / 350));
        ctx.setLineDash([12, 8]);
        
        ctx.beginPath();
        ctx.ellipse(centerX, frameY + frameH * 0.46, frameW * 0.48, frameH * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(16, 185, 129, 0.9)";
        ctx.lineWidth = Math.max(2, Math.round(w / 450));
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(w * 0.15, eyeLevelY);
        ctx.lineTo(w * 0.85, eyeLevelY);
        ctx.stroke();

        ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
        ctx.beginPath();
        ctx.moveTo(w * 0.25, chinY);
        ctx.lineTo(w * 0.75, chinY);
        ctx.stroke();

        ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
        ctx.beginPath();
        ctx.moveTo(centerX, h * 0.05);
        ctx.lineTo(centerX, h * 0.95);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.font = `bold ${Math.round(w * 0.032)}px sans-serif`;
        ctx.fillStyle = "rgba(16, 185, 129, 0.95)";
        ctx.fillText("Đường kẻ mắt (Eye level)", w * 0.16, eyeLevelY - 8);
        ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
        ctx.fillText("Đường cằm (Chin)", w * 0.26, chinY + 24);
        ctx.fillStyle = "rgba(59, 130, 246, 0.95)";
        ctx.fillText("Khung mặt 2x3 (70-80%)", frameX + 10, frameY + 24);
      }

      if (guideType === "grid" || guideType === "all") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
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
    const sheetW = isA4 ? 2480 : 1800;
    const sheetH = isA4 ? 3508 : 1200;

    canvas.width = sheetW;
    canvas.height = sheetH;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, sheetW, sheetH);

    const photoW = activePreset.widthPx * 0.75;
    const photoH = activePreset.heightPx * 0.75;

    let cols = isA4 ? 4 : 3;
    let rows = isA4 ? 4 : 2;

    if (activePreset.id === "4x6") {
      cols = isA4 ? 4 : 2;
      rows = isA4 ? 3 : 2;
    } else if (activePreset.id === "3x4") {
      cols = isA4 ? 5 : 4;
      rows = isA4 ? 4 : 2;
    }

    const gapX = Math.round(sheetW * 0.03);
    const gapY = Math.round(sheetH * 0.03);

    const totalGridW = cols * photoW + (cols - 1) * gapX;
    const totalGridH = rows * photoH + (rows - 1) * gapY;

    const startX = (sheetW - totalGridW) / 2;
    const startY = (sheetH - totalGridH) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (photoW + gapX);
        const y = startY + r * (photoH + gapY);

        ctx.drawImage(singleCanvas, x, y, photoW, photoH);

        ctx.strokeStyle = "#CBD5E1";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x, y, photoW, photoH);

        ctx.strokeStyle = "#64748B";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        const tick = 12;
        ctx.beginPath();
        ctx.moveTo(x - tick, y); ctx.lineTo(x, y);
        ctx.moveTo(x, y - tick); ctx.lineTo(x, y);
        ctx.moveTo(x + photoW, y); ctx.lineTo(x + photoW + tick, y);
        ctx.moveTo(x + photoW, y - tick); ctx.lineTo(x + photoW, y);
        ctx.moveTo(x - tick, y + photoH); ctx.lineTo(x, y + photoH);
        ctx.moveTo(x, y + photoH); ctx.lineTo(x, y + photoH + tick);
        ctx.moveTo(x + photoW, y + photoH); ctx.lineTo(x + photoW + tick, y + photoH);
        ctx.moveTo(x + photoW, y + photoH); ctx.lineTo(x + photoW, y + photoH + tick);
        ctx.stroke();
      }
    }

    ctx.font = `bold ${Math.round(sheetW * 0.016)}px sans-serif`;
    ctx.fillStyle = "#64748B";
    ctx.textAlign = "center";
    ctx.fillText(
      `Bản in ảnh chuẩn 300 DPI — Khổ ${activePreset.name} — In trên giấy ảnh bóng (Glossy Photo Paper)`,
      sheetW / 2,
      startY - 20
    );
  }, [renderSinglePhoto, sheetLayout, activePreset]);

  useEffect(() => {
    renderPrintSheet();
  }, [renderPrintSheet]);

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

  const downloadSinglePhoto = () => {
    const canvas = document.createElement("canvas");
    renderSinglePhoto(canvas, false);
    const mime = exportFormat;
    const ext = exportFormat === "image/png" ? "png" : "jpg";
    const dataUrl = canvas.toDataURL(mime, exportQuality);
    const link = document.createElement("a");
    link.download = `anh_ho_chieu_${activePreset.id}_300dpi.${ext}`;
    link.href = dataUrl;
    link.click();
    toast.success(`Đã tải ảnh hộ chiếu ${activePreset.id.toUpperCase()} (300 DPI)!`);
  };

  const downloadSheet = () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const mime = exportFormat;
    const ext = exportFormat === "image/png" ? "png" : "jpg";
    const dataUrl = canvas.toDataURL(mime, exportQuality);
    const link = document.createElement("a");
    link.download = `ban_in_anh_the_${sheetLayout}_${activePreset.id}.${ext}`;
    link.href = dataUrl;
    link.click();
    toast.success(`Đã tải bản in ảnh thẻ khổ ${sheetLayout === "a4" ? "A4" : "10x15cm"} sẵn sàng in!`);
  };

  const jsonContract = {
    image_path: `workspace/passport_${activePreset.id}_bg.png`,
    crop_ratio: `${activePreset.ratioW}:${activePreset.ratioH}`,
    dimensions_mm: `${activePreset.widthMm}x${activePreset.heightMm}mm`,
    resolution_dpi: 300,
    dimensions_px: `${activePreset.widthPx}x${activePreset.heightPx}px`,
    bg_color: activeBgColor,
    checklist: {
      white_background: activeBgColor.toLowerCase() === "#ffffff",
      ratio_standard: true,
      face_in_frame: zoom >= 0.85 && zoom <= 1.5,
      eyes_level: true,
      no_accessories: true,
      dpi_300_ready: true,
    },
    warnings: [
      "Vui lòng kiểm tra lại tóc không che lông mày, trán và vành tai trước khi nộp.",
      "Khuyến nghị in ảnh trên giấy ảnh bóng (Glossy Photo Paper) chuẩn 300 DPI.",
      "Đảm bảo nét mặt nghiêm túc, mắt nhìn thẳng, không đeo kính râm / kính màu.",
    ],
    fallback_used: !removedBgImg && sourceImg !== null,
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
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="bg-primary hover:bg-primary">
                Chuẩn ICAO & Cục Quản lý XNK
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                100% In-Browser & Bảo mật
              </Badge>
              <Badge variant="secondary">300 DPI Sắc Nét</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
              Làm ảnh hộ chiếu chuẩn 4x6 BG — Tự động tách nền, căn mặt, xuất sẵn
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
              Chuẩn hóa ảnh chân dung thành ảnh hộ chiếu / ảnh thẻ đạt tiêu chuẩn thủ tục hành chính: tách nền AI, đổi nền trắng/xanh, căn khung mặt 2x3, xuất file đơn hoặc bảng in nhiều ảnh 300 DPI.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {!sourceImg ? (
              <Button onClick={loadSampleImage} variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Thử ảnh mẫu
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
                  <span className="hidden sm:inline">Kéo chuột trên ảnh để dịch chuyển</span>
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
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-10 text-center transition-all hover:border-primary/60 hover:bg-primary/10 cursor-pointer"
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
                    Hỗ trợ JPG, PNG, WEBP lên đến 20MB. Xử lý trực tiếp trên trình duyệt — không tải lên máy chủ.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button type="button" className="gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Tải ảnh từ máy tính
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadSampleImage();
                      }}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Dùng ảnh mẫu thử
                    </Button>
                  </div>
                  <input
                    id="passport-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>
              ) : (
                /* Interactive Canvas Area */
                <div className="space-y-4">
                  <div className="relative flex min-h-[460px] items-center justify-center rounded-xl bg-slate-950/5 dark:bg-slate-950/50 p-4 border border-border/50">
                    <div className="relative overflow-hidden rounded-lg shadow-2xl ring-1 ring-border/30 bg-white">
                      <canvas
                        ref={canvasRef}
                        className="max-h-[440px] max-w-full cursor-grab active:cursor-grabbing object-contain"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        title="Kéo để di chuyển vị trí khuôn mặt"
                      />
                    </div>

                    {isRemovingBg && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-background/85 backdrop-blur-sm p-6 text-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-3" />
                        <p className="font-semibold text-foreground">Đang xử lý tách nền AI...</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                          Mô hình Neural Network đang chạy trực tiếp trên thiết bị của bạn.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Canvas Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {activePreset.widthMm}×{activePreset.heightMm} mm ({activePreset.widthPx}×{activePreset.heightPx} px)
                      </Badge>
                      <Badge variant="secondary">300 DPI</Badge>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setZoom(1);
                          setPanX(0);
                          setPanY(0);
                          setRotation(0);
                          setBrightness(100);
                          setContrast(100);
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Đặt lại căn chỉnh
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
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t text-xs">
                  <span className="font-medium text-muted-foreground">Chế độ đường dẫn:</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={guideType === "all" ? "secondary" : "ghost"}
                      className="h-7 text-xs"
                      onClick={() => setGuideType("all")}
                    >
                      Đầy đủ (Khung + Trục)
                    </Button>
                    <Button
                      size="sm"
                      variant={guideType === "standard" ? "secondary" : "ghost"}
                      className="h-7 text-xs"
                      onClick={() => setGuideType("standard")}
                    >
                      Chuẩn ICAO 2x3
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
                Chọn chuẩn ảnh theo hồ sơ hành chính hoặc thị thực yêu cầu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <Select value={selectedPresetId} onValueChange={setSelectedPresetId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn kích thước" />
                </SelectTrigger>
                <SelectContent>
                  {PRESETS.map((p) => (
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
                Đổi màu phông chuẩn trắng (hộ chiếu) hoặc xanh (thẻ ID/bằng lái)
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
                  <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Đã tách nền AI sạch sẽ và áp dụng phông màu chuẩn
                  </p>
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
                          <SelectItem value="image/jpeg">JPG (Chuẩn dịch vụ công)</SelectItem>
                          <SelectItem value="image/png">PNG (Chất lượng tối đa)</SelectItem>
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

                  <Button
                    onClick={downloadSinglePhoto}
                    disabled={!sourceImg}
                    className="w-full gap-2 text-sm font-medium"
                    size="lg"
                  >
                    <Download className="h-4 w-4" />
                    Tải 1 ảnh chuẩn {activePreset.name.split(" ")[0]} (300 DPI)
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
                        <SelectItem value="4x6_inch">Khổ 10x15 cm (4x6 inch) — Tiệm ảnh thông dụng</SelectItem>
                        <SelectItem value="a4">Khổ A4 (210×297 mm) — Nhiều ảnh trên 1 tờ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hidden sheet canvas for rendering */}
                  <div className="hidden">
                    <canvas ref={sheetCanvasRef} />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Bản in đã tự động sắp xếp lưới nhiều ảnh kèm đường cắt nét đứt (Crop marks), giúp bạn tiết kiệm chi phí in ấn tại tiệm ảnh hoặc máy in gia đình.
                  </p>

                  <Button
                    onClick={downloadSheet}
                    disabled={!sourceImg}
                    variant="outline"
                    className="w-full gap-2 text-sm font-medium border-primary/40 hover:bg-primary/5"
                    size="lg"
                  >
                    <Printer className="h-4 w-4 text-primary" />
                    Tải bản in {sheetLayout === "a4" ? "A4" : "10x15cm"} (Kèm đường cắt)
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Standards Checklist Card */}
          <Card className="border-border/80">
            <CardHeader className="py-3.5 border-b bg-muted/20">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Checklist tiêu chuẩn hộ chiếu</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium lowercase">Đạt chuẩn 6/6</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Nền đơn sắc đạt chuẩn: {activeBgColor === "#FFFFFF" ? "Trắng tinh khiết" : "Màu đồng nhất"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Tỷ lệ khung hình: Khung {activePreset.ratioW}:{activePreset.ratioH} đúng chuẩn</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Khuôn mặt chiếm 70–80% chiều cao ảnh, hướng thẳng</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Đường kẻ mắt nằm trong khoảng 55–60% từ đáy ảnh lên</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Độ nét in ấn: Xuất file 300 DPI sắc nét, không vỡ hạt</span>
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
              Quy định ảnh Hộ chiếu Việt Nam (Cục Quản lý XNK)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Thời hạn chụp:</strong> Ảnh được chụp trong vòng 6 tháng gần nhất.</li>
              <li><strong>Phông nền:</strong> Phông nền trắng đồng màu, không có hoa văn hoặc bóng đổ phía sau.</li>
              <li><strong>Trang phục:</strong> Mặc thường phục lịch sự, khuyến khích mặc áo sơ mi trắng hoặc áo có cổ.</li>
              <li><strong>Tóc & Phụ kiện:</strong> Đầu để trần, tóc gọn gàng để lộ rõ trán, 2 vành tai và lông mày.</li>
              <li><strong>Kính mắt:</strong> Không đeo kính râm, kính màu hoặc kính có gọng quá dày gây khuất mắt.</li>
              <li><strong>Thần thái:</strong> Mặt nhìn thẳng vào ống kính máy ảnh, không nghiêng vẹo, miệng ngậm tự nhiên.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Lưu ý khi nộp hồ sơ Online & In ấn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Nộp cổng Dịch vụ công:</strong> Tải file ảnh JPG/PNG đơn ở trên để tải trực tiếp lên hồ sơ cấp hộ chiếu online.</li>
              <li><strong>Độ phân giải in:</strong> Tệp xuất ra đã được tính toán ở chuẩn <strong>300 DPI</strong>, đảm bảo sắc nét khi in ảnh.</li>
              <li><strong>Loại giấy in khuyến nghị:</strong> Nên in trên <em>giấy ảnh bóng (Glossy Photo Paper)</em> để màu sắc trung thực và bền màu.</li>
              <li><strong>In tiết kiệm:</strong> Sử dụng tab <em>"Bản in nhiều ảnh"</em> để in 4–6 ảnh 4x6 trên 1 tờ 10x15cm với chi phí chỉ vài nghìn đồng.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
