import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { INIT_TREE as CONSTRUCTION_TREE } from "@/mock/mock-data";
const ADMIN_CATEGORY_TREE = CONSTRUCTION_TREE;

// Layouts
import PublicLayout from "@/Layouts/PublicLayout";
import AuthLayout from "@/Layouts/AuthLayout";
import UserLayout from "@/Layouts/UserLayout";
import ProjectExplorerLayout from "@/Layouts/ProjectExplorerLayout";
import AdminLayout from "@/Layouts/AdminLayout";
import SubscriptionLayout from "@/Layouts/SubscriptionLayout";
import ResourcesLayout from "@/Layouts/ResourcesLayout";

// Auth Pages
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import ForgotPassword from "@/pages/Auth/ForgetPassword";
import Subscription from "@/pages/Auth/Subscription";

// User Pages
import Home from "@/pages/User/Home";
import PublicArticles from "@/pages/User/PublicArticles";
import ArticleView from "@/pages/User/ArticleView";
import UserDashboard from "@/pages/User/UserDashboard";
import UserProfile from "@/pages/User/UserProfile";
import ProjectOverview from "@/pages/User/ProjectOverview";
import CategoryDetail from "@/pages/User/CategoryDetail";
import ProjectHistory from "@/pages/User/ProjectHistory";

// Admin Pages
import Dashboard from "@/pages/Admin/Dashboard";
import Users from "@/pages/Admin/UsersPage";
import Modules from "@/pages/Admin/Modules";
import AdminArticles from "@/pages/Admin/AdminArticles";
import ArticleEditor from "@/pages/Admin/ArticleEditor";
import Tags from "@/pages/Admin/Tags";
import PlanFeatures from "@/pages/Admin/PlanFeatures";
import PlanTypes from "@/pages/Admin/PlanTypes";
import Subscribers from "@/pages/Admin/Subscribers";
import Materials from "@/pages/Admin/Materials";
import Services from "@/pages/Admin/Services";
import Units from "@/pages/Admin/Units";

// We'll use dummy components for now for those that might need separate views later, or they could refer to same files.
import { Outlet } from "react-router-dom";
const CategoryTree = () => <Outlet />;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<PublicArticles />} />
            <Route path="/articles/:id" element={<ArticleView />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="/choose-plan" element={<Subscription />} />

          <Route element={<UserLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/projects/:projectId" element={<ProjectOverview />} />
            <Route path="/projects/:projectId/history" element={<ProjectHistory />} />
          </Route>

          <Route path="/projects/:projectId/explorer" element={<ProjectExplorerLayout treeData={CONSTRUCTION_TREE} />}>
            <Route index element={<CategoryDetail />} />
            <Route path=":categoryId" element={<CategoryDetail />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            
            <Route path="subscriptions" element={<SubscriptionLayout />}>
              <Route index element={<PlanFeatures />} />
              <Route path="types" element={<PlanTypes />} />
              <Route path="subscribers" element={<Subscribers />} />
            </Route>

            <Route path="resources" element={<ResourcesLayout />}>
              <Route index element={<Materials />} />
              <Route path="services" element={<Services />} />
              <Route path="units" element={<Units />} />
            </Route>
            
            <Route path="articles" element={<AdminArticles />} />
            <Route path="articles/new" element={<ArticleEditor />} />
            <Route path="articles/:id/edit" element={<ArticleEditor />} />
            <Route path="articles/tags" element={<Tags />} />
            
            <Route path="modules" element={<CategoryTree tree={ADMIN_CATEGORY_TREE} />}>
              <Route index element={<Modules />} />
              <Route path=":id" element={<Modules />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
