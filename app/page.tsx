import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import TechStack from "@/components/TechStack";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getFeaturedRepo, getRecentRepos } from "@/lib/github";
import { featuredProject } from "@/lib/data";

export default async function Home() {
  const [featuredRepo, recentRepos] = await Promise.all([
    getFeaturedRepo(featuredProject.repo),
    getRecentRepos(["mfloresr.github.io", "Mfloresr", featuredProject.repo]),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <TechStack />
        <Projects featuredRepo={featuredRepo} recentRepos={recentRepos} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
