<template>
  <div class="app-wrapper">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="brand">
            <div class="logo-wrapper">
              <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <div class="brand-text">
                <div class="logo">壁纸中心</div>
                <div class="tagline">高品质桌面壁纸</div>
              </div>
            </div>
          </div>

          <nav class="nav">
            <router-link to="/" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
              <span>首页</span>
            </router-link>

            <router-link to="/wallpapers" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span>壁纸</span>
            </router-link>

            <div v-if="!user" class="auth-section">
              <router-link to="/login" class="btn-primary">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                </svg>
                登录
              </router-link>
            </div>

            <div v-else class="user-section">
              <router-link to="/upload" class="nav-link">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span>上传</span>
              </router-link>

              <button class="coins-btn" @click="goRecharge">
                <svg class="coin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v12M15 9H9.5a2.5 2.5 0 000 5h5a2.5 2.5 0 010 5H9" />
                </svg>
                <span class="coin-amount">{{ user.coins || 0 }}</span>
                <span class="recharge-hint">充值</span>
              </button>

              <router-link v-if="user && (user.role === 'admin' || user.isAdmin)" to="/admin"
                class="nav-link admin-link">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path
                    d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                <span>管理</span>
              </router-link>

              <div class="dropdown">
                <button class="user-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
                <div class="dropdown-menu">
                  <router-link to="/me" class="dropdown-item">
                    <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    个人中心
                  </router-link>
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item logout" @click="logout">
                    <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    登出
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <!-- Mobile Menu Toggle -->
          <button class="mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
            <svg v-if="!mobileMenuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Mobile Menu -->
        <transition name="slide">
          <div v-if="mobileMenuOpen" class="mobile-menu">
            <router-link to="/" class="mobile-link" @click="mobileMenuOpen = false">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              首页
            </router-link>
            <router-link to="/wallpapers" class="mobile-link" @click="mobileMenuOpen = false">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
              壁纸
            </router-link>
            <div v-if="user">
              <router-link to="/upload" class="mobile-link" @click="mobileMenuOpen = false">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                上传
              </router-link>
              <router-link to="/me" class="mobile-link" @click="mobileMenuOpen = false">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="7" r="4" />
                </svg>
                个人中心
              </router-link>
            </div>
          </div>
        </transition>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <router-view />
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="logo">壁纸中心</div>
            <p class="footer-desc">发现和分享高品质桌面壁纸</p>
          </div>
          <div class="footer-links">
            <div class="footer-section">
              <h4>产品</h4>
              <a href="#">浏览壁纸</a>
              <a href="#">上传作品</a>
              <a href="#">会员服务</a>
            </div>
            <div class="footer-section">
              <h4>支持</h4>
              <a href="#">帮助中心</a>
              <a href="#">联系我们</a>
              <a href="#">反馈建议</a>
            </div>
            <div class="footer-section">
              <h4>关于</h4>
              <a href="#">关于我们</a>
              <a href="#">服务条款</a>
              <a href="#">隐私政策</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© {{ new Date().getFullYear() }} 壁纸中心 — 演示前端</p>
          <div class="footer-social">
            <a href="#" class="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a href="#" class="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
            <a href="#" class="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="white" stroke-width="2" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>

    <ChatWidget />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './store/user'
import ChatWidget from './pages/ChatWidget.vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const router = useRouter()
const mobileMenuOpen = ref(false)

const goRecharge = () => {
  router.push('/recharge')
  mobileMenuOpen.value = false
}

async function logout() {
  userStore.logout()
  router.push('/login')
  mobileMenuOpen.value = false
}
</script>

<style>
:root {
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;
  --secondary: #8b5cf6;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;

  --bg-primary: #0a0f1e;
  --bg-secondary: #0f172a;
  --bg-tertiary: #1e293b;

  --surface: rgba(255, 255, 255, 0.03);
  --surface-hover: rgba(255, 255, 255, 0.06);

  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;

  --border: rgba(255, 255, 255, 0.08);
  --border-light: rgba(255, 255, 255, 0.05);

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.6);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, #1a1f35 100%);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--surface);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--surface-hover);
}
</style>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 15, 30, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  gap: 24px;
  max-height: 60px;
}

/* Brand */
.brand {
  flex-shrink: 0;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: var(--primary);
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.tagline {
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 500;
}

/* Navigation */
.nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--surface);
}

.nav-link.router-link-active {
  color: var(--primary);
  background: rgba(59, 130, 246, 0.1);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 14px;
  right: 14px;
  height: 2px;
  background: var(--primary);
  border-radius: 2px 2px 0 0;
}

.nav-link.admin-link {
  color: var(--warning);
}

.nav-link.admin-link.router-link-active {
  background: rgba(245, 158, 11, 0.1);
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Buttons */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* Coins Button */
.coins-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  color: #fbbf24;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.coins-btn:hover {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%);
  border-color: rgba(251, 191, 36, 0.4);
  transform: translateY(-1px);
}

.coin-icon {
  width: 18px;
  height: 18px;
}

.coin-amount {
  font-weight: 700;
  font-size: 15px;
}

.recharge-hint {
  font-size: 12px;
  opacity: 0.7;
}

/* User Dropdown */
.dropdown {
  position: relative;
}

.user-avatar {
  width: 32px;
  height: 32px;
  padding: 5px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar svg {
  width: 18px;
  height: 18px;
  color: var(--primary);
}

.user-avatar:hover {
  background: var(--surface-hover);
  border-color: var(--primary);
  transform: scale(1.05);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
  text-align: left;
}

.dropdown-item:first-child {
  border-radius: 12px 12px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 12px 12px;
}

.dropdown-item:hover {
  background: var(--surface);
  color: var(--text-primary);
}

.dropdown-item.logout {
  color: var(--danger);
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

.dropdown-icon {
  width: 16px;
  height: 16px;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-light);
  margin: 4px 0;
}

/* Mobile Toggle */
.mobile-toggle {
  display: none;
  width: 40px;
  height: 40px;
  padding: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-toggle:hover {
  background: var(--surface-hover);
}

.mobile-toggle svg {
  width: 100%;
  height: 100%;
}

/* Mobile Menu */
.mobile-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-top: 1px solid var(--border-light);
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mobile-link:hover,
.mobile-link.router-link-active {
  color: var(--primary);
  background: rgba(59, 130, 246, 0.1);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 24px 0;
  min-height: calc(100vh - 200px);
}

/* Footer */
.footer {
  background: rgba(10, 15, 30, 0.6);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-light);
  padding: 48px 0 24px;
  margin-top: 64px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 48px;
  margin-bottom: 32px;
}

.footer-brand .logo {
  font-size: 24px;
  margin-bottom: 12px;
}

.footer-desc {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.footer-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-section a {
  display: block;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 8px;
  transition: color 0.2s ease;
}

.footer-section a:hover {
  color: var(--primary);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}

.footer-bottom p {
  color: var(--text-muted);
  font-size: 14px;
}

.footer-social {
  display: flex;
  gap: 12px;
}

.social-link {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.social-link:hover {
  background: var(--surface-hover);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
}

.social-link svg {
  width: 18px;
  height: 18px;
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-links {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .nav {
    display: none;
  }

  .mobile-toggle {
    display: flex;
  }

  .logo {
    font-size: 18px;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
  }

  .tagline {
    display: none;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .main-content {
    padding: 24px 0;
  }
}

@media (max-width: 480px) {
  .brand-text {
    display: none;
  }

  .logo-wrapper {
    gap: 0;
  }

  .header-content {
    padding: 12px 0;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-content>* {
  animation: fadeIn 0.4s ease both;
}

/* Image Gallery Styles - 可在壁纸页面使用 */
.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 24px 0;
}

.wallpaper-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  aspect-ratio: 16 / 10;
}

.wallpaper-card:hover {
  transform: translateY(-8px);
  border-color: var(--primary);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(59, 130, 246, 0.3);
}

.wallpaper-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.wallpaper-card:hover .wallpaper-image {
  transform: scale(1.08);
}

.wallpaper-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
      transparent 0%,
      transparent 50%,
      rgba(0, 0, 0, 0.8) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
}

.wallpaper-card:hover .wallpaper-overlay {
  opacity: 1;
}

.wallpaper-title {
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.wallpaper-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.wallpaper-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.wallpaper-badge.premium {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2));
  color: #fbbf24;
}

.wallpaper-badge.free {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

/* Masonry Layout Alternative */
.wallpaper-masonry {
  column-count: 3;
  column-gap: 24px;
  padding: 24px 0;
}

.wallpaper-masonry .wallpaper-card {
  break-inside: avoid;
  margin-bottom: 24px;
  aspect-ratio: auto;
}

.wallpaper-masonry .wallpaper-card img {
  width: 100%;
  height: auto;
  display: block;
}

/* Featured Wallpaper */
.featured-wallpaper {
  position: relative;
  height: 450px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 48px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.featured-wallpaper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
      transparent 0%,
      rgba(0, 0, 0, 0.3) 50%,
      rgba(0, 0, 0, 0.9) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px;
}

.featured-title {
  font-size: 36px;
  font-weight: 800;
  color: white;
  margin-bottom: 12px;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.featured-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24px;
  max-width: 600px;
}

.featured-actions {
  display: flex;
  gap: 12px;
}

.featured-btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.featured-btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}

.featured-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.featured-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.featured-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Loading Skeleton */
.wallpaper-skeleton {
  aspect-ratio: 16 / 10;
  background: linear-gradient(90deg,
      var(--surface) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      var(--surface) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 16px;
  border: 1px solid var(--border);
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

/* Responsive Gallery */
@media (max-width: 1024px) {
  .wallpaper-masonry {
    column-count: 2;
  }

  .wallpaper-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }

  .featured-wallpaper {
    height: 350px;
  }

  .featured-overlay {
    padding: 32px;
  }

  .featured-title {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .wallpaper-masonry {
    column-count: 1;
  }

  .wallpaper-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .featured-wallpaper {
    height: 280px;
    border-radius: 16px;
    margin-bottom: 32px;
  }

  .featured-overlay {
    padding: 24px;
  }

  .featured-title {
    font-size: 24px;
  }

  .featured-description {
    font-size: 14px;
  }

  .featured-actions {
    flex-direction: column;
  }

  .featured-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
