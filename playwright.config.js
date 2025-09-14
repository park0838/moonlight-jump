// Playwright configuration for headless Chrome mode
// Optimized for memory usage and performance during automated testing

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Run tests in headless mode for better performance
  use: {
    // Browser settings
    headless: true,
    
    // Chrome-specific optimizations for memory usage
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-ipc-flooding-protection',
        '--memory-pressure-off',
        '--max_old_space_size=4096'
      ]
    },
    
    // Viewport settings
    viewport: { width: 1280, height: 720 },
    
    // Reduce timeouts for faster execution
    actionTimeout: 10000,
    navigationTimeout: 15000,
    
    // Disable video recording to save memory
    video: 'off',
    
    // Only take screenshots on failure
    screenshot: 'only-on-failure',
    
    // Reduce trace collection
    trace: 'retain-on-failure'
  },

  // Configure projects for different browsers (all headless)
  projects: [
    {
      name: 'chromium-headless',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--memory-pressure-off'
          ]
        }
      }
    },
    
    {
      name: 'webkit-headless',
      use: { 
        ...devices['Desktop Safari'],
        headless: true
      }
    },
    
    {
      name: 'firefox-headless',
      use: { 
        ...devices['Desktop Firefox'],
        headless: true
      }
    }
  ],

  // Global test settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  // Optimize for CI/testing environments
  fullyParallel: false, // Reduce memory pressure
  workers: process.env.CI ? 1 : 2, // Limit concurrent workers
  retries: process.env.CI ? 2 : 0,
  
  // Reporter configuration
  reporter: [
    ['line'],
    ['html', { open: 'never' }]
  ],

  // Web server configuration (if needed)
  webServer: {
    command: 'python -m http.server 3000',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe'
  }
});