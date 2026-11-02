{
  description = "Development environment with Node.js 24.22.1";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
  flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = nixpkgs.legacyPackages.${system};

      # Custom Node.js 24.22.1 derivation
      nodeInfo = {
        "x86_64-linux" = {
          url = "https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.xz";
          hash = "sha256-bBcqmrZxj3uAH7WnvUhq8u5eMnWAhqBLhPzOKqdwleY=";
        };
        "aarch64-linux" = {
          url = "https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-arm64.tar.xz";
          hash = "sha256-26v3ocv5R+YFn/rSwnuABB25feoeVTtir97n8T/KM24=";
        };
        "x86_64-darwin" = {
          url = "https://nodejs.org/dist/v24.22.1/node-v24.22.1-darwin-x64.tar.xz";
          hash = "sha256-ZeRQ+Qpuqs1QAPYRhhxM5l+tyH+BN5XcTtDA5fL8otQ=";
        };
        "aarch64-darwin" = {
          url = "https://nodejs.org/dist/v24.22.1/node-v24.22.1-darwin-arm64.tar.xz";
          hash = "sha256-ZUunneYVVkfiIyGTK0Xyocy3BZdswzfJuOJ4vrCFpig=";
        };
      };

      currentNodeInfo = nodeInfo.${system} or (throw "Unsupported system: ${system}");

      nodejs-24_22_1 = pkgs.stdenv.mkDerivation rec {
        pname = "nodejs";
        version = "24.22.1";

        src = pkgs.fetchurl {
          url = currentNodeInfo.url;
          hash = currentNodeInfo.hash;
        };

        installPhase = ''
          mkdir -p $out
          cp -r * $out/
        '';
      };
    in
    {
      devShells.default = pkgs.mkShell {
        buildInputs = [
          nodejs-24_22_1
        ];

        nativeBuildInputs = with pkgs; [
          # Run your GitHub Actions locally!
          act

          # End-to-end testing
          cypress

          # Linting
          eslint

          # Package manager
          yarn-berry
        ];

        shellHook = ''
          echo "Node.js $(node --version) environment loaded"
          echo "npm $(npm --version) available"
        '';
      };
    }
  );
}
