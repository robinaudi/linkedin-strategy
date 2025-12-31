# React Slide Deck Framework (Firebase + CMS)

這是一個基於 React + Vite + Firebase 建構的「互動式簡報網站框架」。
具備**前台滑動閱覽**、**後台 CMS 即時編輯**、**PDF 生成下載**以及**Google 登入權限管理**等功能。非常適合用來製作「知識型內容網站」或「電子書導流頁面」。

## 🚀 主要功能 (Features)

1.  **互動式簡報 (Interactive Slide Deck)**
    *   類似 PPT 的全螢幕滑動體驗。
    *   支援多種版型：封面 (Intro)、章節 (Agenda)、觀點 (Concept)、資源 (Resource)、結尾 (Outro)。
    *   鍵盤左右鍵、點擊皆可切換。

2.  **內建內容管理系統 (CMS)**
    *   `/cms` 路徑進入後台（需管理員權限）。
    *   即時編輯文字、更換圖片連結。
    *   **即時預覽**編輯結果。
    *   **一鍵重置 (Reset)**：資料損壞時可恢復預設值。

3.  **PDF 生成與下載 (PDF Generation)**
    *   前端即時將簡報渲染為圖片並打包成 A4 PDF。
    *   支援 **無痕模式 (Incognito)** 下載（自動轉址登入 fallback）。
    *   **問卷牆 (Survey Wall)**：下載前強制/選擇性填寫問卷。
    *   **每日下載限制**：防止惡意爬蟲。

4.  **強健的資料保護 (Robust Data & Auth)**
    *   Firebase Google Auth 整合。
    *   **自動修復機制 (Auto-Repair)**：防止資料庫欄位缺失導致白畫面 (White Screen)。
    *   **防呆設計**：嚴格的資料結構檢查 (Schema Validation)。

## 🛠 技術棧 (Tech Stack)

*   **Frontend**: React, Vite
*   **Styling**: Tailwind CSS
*   **Backend / DB**: Firebase (Hosting, Firestore, Authentication)
*   **PDF Tools**: html2canvas, jspdf
*   **Icons**: lucide-react

---

## 🏃‍♂️ 快速開始 (Getting Started)

### 1. 安裝依賴
```bash
npm install
```

### 2. 設定 Firebase
1.  在 Firebase Console 建立新專案。
2.  啟用 **Authentication** (Google Sign-in)。
3.  啟用 **Firestore Database**。
4.  複製 Firebase Config (`apiKey`, `authDomain`...)。
5.  建立 `src/firebase.config.js`：
```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // 填入你的 Firebase 設定
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 3. 本地開發
```bash
npm run dev
```
瀏覽器打開 `http://localhost:5173`。

---

## 📂 專案結構 (Project Structure)

```text
src/
├── components/
│   ├── SlideDeck.jsx        # 前台：簡報播放器核心
│   ├── SlideContent.jsx     # 前台：單頁簡報渲染邏輯 (各版型樣式)
│   ├── CMS.jsx              # 後台：內容編輯器
│   ├── PdfSlides.jsx        # PDF：專門用於生成 PDF 的隱藏渲染層
│   └── DownloadSurveyModal.jsx  # 下載前的問卷/登入彈窗
├── data/
│   └── slides.js            # 【關鍵】預設簡報內容 (Default Content)
├── hooks/
│   └── useContent.js        # 資料讀取 Hook (包含防呆預設值)
├── App.jsx                  # 主程式：路由、Auth 監聽、自動修復邏輯
└── main.jsx                 # 入口點
```

## ⚙️ 重要設定與修改指南

### 1. 修改預設內容
編輯 `src/data/slides.js`。這是網站的「出廠預設值」。
當 Firebase 資料庫為空或損壞時，系統會自動讀取此檔案並修復資料庫。
**格式範例**：
```javascript
export const slideData = [
    {
        type: "intro", // 版型：intro, agenda, concept, resource, outro
        title: "你的標題",
        subtitle: "你的副標題",
        author: "作者名"
    },
    // ...
];
```

### 2. 修改 PDF 設定
在 `src/App.jsx` 中，你可以調整 PDF 下載模式（開放/需登入/關閉）：
系統預設會讀取 Firestore 的 `settings/global` 文件，但你也可以在 `App.jsx` 的 `pdfSettings` 預設值中修改。

### 3. Firestore 安全規則 (firestore.rules)
建議設定：
```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許所有人讀取內容（解決無痕模式問題）
    match /content/{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // 只有管理員可編輯
    }
    // 下載紀錄需驗證
    match /downloads/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 部署 (Deployment)

使用 Firebase Hosting 部署：

```bash
# 1. 建置
npm run build

# 2. 部署
firebase deploy --only hosting
```

(若有修改 Firestore 規則，也要部署 `firebase deploy --only firestore:rules`)

---

## ⚠️ 常見問題處理

*   **白畫面 (White Screen)**：
    *   通常是因為資料庫欄位缺失。
    *   **解法**：管理員重新整理首頁，`App.jsx` 中的 `Auto-Repair` 機制會自動檢測並修復。
*   **無痕模式無法下載**：
    *   這是因為第三方 Cookie 被擋。
    *   **解法**：系統已內建 `signInWithRedirect` fallback 機制，會自動跳轉頁面完成登入。

---
**Framework Version**: v1.5 (Stable)
**Last Updated**: 2025-12-31
