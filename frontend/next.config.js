module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/upload', destination: 'http://localhost:8000/upload' },
      { source: '/chat', destination: 'http://localhost:8000/chat' },
      // Add other rewrites if needed
    ];
  },
};
