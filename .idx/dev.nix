{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [ pkgs.python3 pkgs.nodejs_20 ];
  idx = {
    extensions = [ "ms-python.python" ];
    workspace = {
      onCreate = {
        install = "python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cd frontend && npm install && npx vite build";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = [ "bash" "-c" "source .venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port $PORT" ];
          env = { PORT = "$PORT"; };
          manager = "web";
        };
      };
    };
  };
}