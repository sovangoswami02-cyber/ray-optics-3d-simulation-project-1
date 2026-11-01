#!/usr/bin/env python3
"""
Local development server for 3D Concave Mirror Simulation.
Serves index.html on http://localhost:8080 and automatically launches the web browser.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable caching headers and CORS for smooth local testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f"=======================================================")
    print(f"  SPECULA 3D // Concave Mirror Optics Simulation")
    print(f"  Running on: http://localhost:{PORT}")
    print(f"  Press Ctrl+C to terminate the server.")
    print(f"=======================================================")
    
    # Try to open the default web browser automatically
    try:
        webbrowser.open(f"http://localhost:{PORT}")
    except Exception:
        pass

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.server_close()

if __name__ == "__main__":
    main()

