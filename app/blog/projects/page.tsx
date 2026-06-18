// @ts-nocheck
import Navbar from '@/components/blog/Navbar';
import PageTransition from '@/components/blog/PageTransition';
import ProjectsBoard from './ProjectsBoard';
import {siteConfig} from "@/siteConfig_blog";

export const metadata = {
  title: "项目矩阵 | " + siteConfig.title,
  description: "开源项目与代码仓库展示",
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <div className="mt-28">
          <ProjectsBoard />
        </div>
      </PageTransition>
    </div>
  );
}