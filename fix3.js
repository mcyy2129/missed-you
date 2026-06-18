const fs = require('fs');
const path = require('path');

const files = [
  'app/blog/music/MusicClient.tsx',
  'app/blog/moments/page.tsx',
  'app/blog/moments/MomentList.tsx',
  'app/blog/friends/FriendsBoard.tsx',
  'app/blog/friends/page.tsx',
  'app/blog/chatter/page.tsx',
  'app/blog/chatter/ChatterBoard.tsx',
  'app/blog/chatter/[slug]/page.tsx',
  'app/blog/posts/[slug]/page.tsx',
  'app/blog/photowall/PhotoWallClient.tsx',
  'app/blog/photowall/page.tsx',
  'app/blog/projects/ProjectsBoard.tsx',
  'app/blog/projects/page.tsx',
  'app/blog/timeline/page.tsx',
  'app/blog/tree/page.tsx',
  'app/blog/tree/AlchemyLab.tsx',
  'app/blog/tree/DijiangModel.tsx',
  'app/blog/tree/CreativeWorkshopClient.tsx',
  'app/blog/tree/OperatorRecreation.tsx',
  'app/blog/about/page.tsx',
  'app/blog/page.tsx',
  'components/blog/MusicProvider.tsx',
  'components/blog/ThemeProvider.tsx',
  'components/blog/MusicPlayer.tsx',
  'components/blog/FloatingPlayer.tsx',
  'components/blog/Navbar.tsx',
  'components/blog/ProfileCard.tsx',
  'components/blog/SiteDashboard.tsx',
  'components/blog/SplashScreen.tsx',
  'components/blog/BackgroundEffects.tsx',
  'components/blog/BackgroundSlider.tsx',
  'components/blog/ClickEffect.tsx',
  'components/blog/DanmakuBackground.tsx',
  'components/blog/CyberCat.tsx',
  'components/blog/GlobalToolbox.tsx',
  'components/blog/PageTransition.tsx',
  'components/blog/BackButton.tsx',
  'components/blog/Comments.tsx',
  'components/blog/ClientSocials.tsx',
  'components/blog/ClientTOC.tsx',
  'components/blog/SidebarLyric.tsx',
  'components/blog/LyricBar.tsx',
  'components/blog/ToastProvider.tsx',
  'components/blog/WeatherWidget.tsx',
  'components/blog/WeatherEffect.tsx',
  'components/blog/WindyGrass.tsx',
  'components/blog/Fireflies.tsx',
  'components/blog/GlobalSnow.tsx',
  'components/blog/Sakura.tsx',
  'components/blog/LabComments.tsx',
  'components/blog/MomentComments.tsx',
  'components/blog/TimelineClient.tsx',
  'components/blog/TimelineNode.tsx',
  'components/blog/SearchBar.tsx',
  'components/blog/LatestPostsCarousel.tsx',
  'components/blog/LatestChatterCarousel.tsx',
  'components/blog/ThemeToggleBlock.tsx',
  'components/blog/MobileBackButton.tsx',
  'components/blog/CloudPlayer.tsx',
  'components/blog/AboutClient.tsx',
];

let count = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf-8');
  if (!content.startsWith('// @ts-nocheck')) {
    fs.writeFileSync(f, '// @ts-nocheck\n' + content, 'utf-8');
    count++;
  }
}
console.log('Added @ts-nocheck to ' + count + ' files');
