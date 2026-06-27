import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingTCPServer

class ThreadingHTTPServer(ThreadingTCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    port = 8080
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    
    server = ThreadingHTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler)
    print(f"Starting threaded HTTP server on http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
        server.server_close()
