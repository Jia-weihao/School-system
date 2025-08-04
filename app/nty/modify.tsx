'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './modify.module.css';

// 图片批改组件 
const ImageCorrectionPanel = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [currentTool, setCurrentTool] = useState('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement | null>(null); // 新增注释层画布引用
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (uploadedImage && canvasRef.current && annotationCanvasRef.current) {
      drawImageOnCanvas();
      setupAnnotationCanvas(); // 设置注释层画布
    }
  }, [uploadedImage, rotation]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          setUploadedImage(e.target.result as string);
          setImageUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 设置注释层画布尺寸和样式
  const setupAnnotationCanvas = () => {
    const imageCanvas = canvasRef.current;
    const annotationCanvas = annotationCanvasRef.current;
    if (!imageCanvas || !annotationCanvas) return;

    // 使注释层画布尺寸与图片画布相同
    annotationCanvas.width = imageCanvas.width;
    annotationCanvas.height = imageCanvas.height;

    // 清除注释层
    const ctx = annotationCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
    }
  };

  const drawImageOnCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !uploadedImage) return;

    // 创建新的图片对象
    const img = new Image();
    img.onload = () => {
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 设置canvas尺寸与图片匹配
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;

      // 保持宽高比的同时调整尺寸
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // 根据旋转角度绘制图片
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(
        img,
        -width / 2,
        -height / 2,
        width,
        height
      );
      ctx.restore();

      // 设置注释层画布
      setupAnnotationCanvas();
    };

    img.src = uploadedImage;
  };


  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (currentTool === 'pen' || currentTool === 'eraser') {
      setIsDrawing(true);
      const canvas = annotationCanvasRef.current; // 使用注释层画布
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      setLastX(x);
      setLastY(y);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.lineWidth = currentTool === 'eraser' ? 20 : 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = currentTool === 'pen' ? '#ff0000' : 'rgba(0,0,0,1)';
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (currentTool === 'text') {
      const canvas = annotationCanvasRef.current; // 使用注释层画布
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      setTextPosition({ x, y });
      setShowTextInput(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing || (currentTool !== 'pen' && currentTool !== 'eraser')) return;
    const canvas = annotationCanvasRef.current; // 使用注释层画布
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.lineWidth = currentTool === 'eraser' ? 20 : 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentTool === 'pen' ? '#ff0000' : 'rgba(0,0,0,1)';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    setLastX(x);
    setLastY(y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const addText = () => {
    if (textInput.trim() && annotationCanvasRef.current) {
      const canvas = annotationCanvasRef.current; // 使用注释层画布
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = '24px Arial';
      ctx.fillStyle = '#ff0000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(textInput, textPosition.x, textPosition.y);
      setTextInput('');
      setShowTextInput(false);
    }
  };

  const clearDrawing = () => {
    // 只清除注释层，保留图片层
    const annotationCanvas = annotationCanvasRef.current;
    if (annotationCanvas) {
      const ctx = annotationCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
      }
    }
  };

  const cropImage = () => {
    if (!canvasRef.current || !annotationCanvasRef.current) return;

    const canvas = canvasRef.current;
    const annotationCanvas = annotationCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const annotationCtx = annotationCanvas.getContext('2d');

    // Add null check for ctx
    if (!ctx || !annotationCtx) return;

    // 创建一个新的canvas用于裁剪图片层
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // 创建一个新的canvas用于裁剪注释层
    const tempAnnotationCanvas = document.createElement('canvas');
    const tempAnnotationCtx = tempAnnotationCanvas.getContext('2d');
    if (!tempAnnotationCtx) return;

    // 设置裁剪区域大小
    const cropWidth = 400;
    const cropHeight = 300;
    const startX = (canvas.width - cropWidth) / 2;
    const startY = (canvas.height - cropHeight) / 2;

    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    tempAnnotationCanvas.width = cropWidth;
    tempAnnotationCanvas.height = cropHeight;

    // 将裁剪区域绘制到新canvas
    tempCtx.drawImage(canvas, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    tempAnnotationCtx.drawImage(annotationCanvas, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    // 更新主canvas
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    annotationCanvas.width = cropWidth;
    annotationCanvas.height = cropHeight;
    ctx.drawImage(tempCanvas, 0, 0);
    annotationCtx.drawImage(tempAnnotationCanvas, 0, 0);
  };

  const downloadImage = () => {
    if (!canvasRef.current || !annotationCanvasRef.current) return;

    // 创建一个临时画布来合并图片层和注释层
    const tempCanvas = document.createElement('canvas');
    const imageCanvas = canvasRef.current;
    const annotationCanvas = annotationCanvasRef.current;

    tempCanvas.width = imageCanvas.width;
    tempCanvas.height = imageCanvas.height;

    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // 先绘制图片层
    tempCtx.drawImage(imageCanvas, 0, 0);
    // 再绘制注释层
    tempCtx.drawImage(annotationCanvas, 0, 0);

    // 下载合并后的图片
    const link = document.createElement('a');
    link.download = 'corrected-image.png';
    link.href = tempCanvas.toDataURL();
    (link as HTMLAnchorElement).click();
  };

  return (
    <div className={styles.imageCorrectionPanel}>
      <div className={styles.toolBar}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <button
          onClick={() => (fileInputRef.current as HTMLInputElement | null)?.click()}
          className={styles.toolButton}
        >
          📁 上传图片
        </button>

        <div className={styles.toolGroup}>
          <button
            onClick={() => setCurrentTool('pen')}
            className={`${styles.toolButton} ${currentTool === 'pen' ? styles.active : ''}`}
          >
            ✏️ 画笔
          </button>
          <button
            onClick={() => setCurrentTool('eraser')}
            className={`${styles.toolButton} ${currentTool === 'eraser' ? styles.active : ''}`}
          >
            🧹 橡皮擦
          </button>
          <button
            onClick={() => setCurrentTool('text')}
            className={`${styles.toolButton} ${currentTool === 'text' ? styles.active : ''}`}
          >
            📝 文字
          </button>
        </div>

        <div className={styles.toolGroup}>
          <button onClick={rotateImage} className={styles.toolButton}>
            🔄 旋转
          </button>
          <button onClick={cropImage} className={styles.toolButton}>
            ✂️ 裁剪
          </button>
          <button onClick={clearDrawing} className={styles.toolButton}>
            🗑️ 清除标注
          </button>
          <button onClick={downloadImage} className={styles.toolButton}>
            💾 下载
          </button>
        </div>
      </div>

      <div className={styles.canvasContainer}>
        {uploadedImage ? (
          <>
            <canvas
              ref={canvasRef}
              className={styles.correctionCanvas}
              style={{
                position: 'absolute',
                zIndex: 1,
                maxWidth: '100%',
                maxHeight: '100%',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`
              }}
            />
            <canvas
              ref={annotationCanvasRef}
              className={styles.annotationCanvas}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{
                position: 'absolute',
                zIndex: 2,
                maxWidth: '100%',
                maxHeight: '100%',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                cursor: currentTool === 'pen' ? 'crosshair' :
                  currentTool === 'eraser' ? 'grab' :
                    currentTool === 'text' ? 'text' : 'default'
              }}
            />
            {showTextInput && (
              <div
                className={styles.textInputOverlay}
                style={{
                  position: 'absolute',
                  left: textPosition.x,
                  top: textPosition.y,
                  zIndex: 1000
                }}
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addText()}
                  placeholder="输入文字..."
                  autoFocus
                  className={styles.textInput}
                />
                <button onClick={addText} className={styles.addTextButton}>确定</button>
                <button onClick={() => setShowTextInput(false)} className={styles.cancelTextButton}>取消</button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.uploadPrompt}>
            <p>请上传图片开始批改</p>
            <button
              onClick={() => (fileInputRef.current as HTMLInputElement | null)?.click()}
              className={styles.uploadButton}
            >
              选择图片
            </button>
          </div>
        )}
      </div>

      <div className={styles.imageInfo}>
        {uploadedImage && (
          <div>
            <p>当前工具: {currentTool === 'pen' ? '画笔' : currentTool === 'eraser' ? '橡皮擦' : '文字'}</p>
            <p>旋转角度: {rotation}°</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Modify() {
  return (
    <div>
      <div className={styles.imageCorrectionSection}>
        <h3>图片作业批改</h3>
        <ImageCorrectionPanel />
      </div>
    </div>
  );
}

// 导出ImageCorrectionPanel组件以便其他组件可以使用
export { ImageCorrectionPanel };