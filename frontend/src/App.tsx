import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { LandingV2 } from './pages/Landing.v2';
import { Register } from './pages/Register';
import { TaskSquare } from './pages/TaskSquare';
import { TaskSquareV2 } from './pages/TaskSquare.v2';
import { TaskDetail } from './pages/TaskDetail';
import { Profile } from './pages/Profile';
import { PublishTask } from './pages/PublishTask';
import { ToastContainer } from './components/ui/ToastContainer';

/**
 * 主应用组件
 * P0-F1：钱包连接与注册
 * P0-F2：任务广场与详情
 * P0-F3：Profile 页面
 * P0-F4：发布任务
 * 
 * UI V2: 通过 VITE_UI_V2 环境变量切换新旧 UI
 */

// UI V2 开关
const isUIV2 = import.meta.env.VITE_UI_V2 === 'true';

function App() {
  // 根据环境变量选择组件
  const HomeComponent = isUIV2 ? LandingV2 : Home;
  const TaskSquareComponent = isUIV2 ? TaskSquareV2 : TaskSquare;
  
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<TaskSquareComponent />} />
        <Route path="/tasks/:taskId" element={<TaskDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/publish" element={<PublishTask />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
