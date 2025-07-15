{
  description = "Development environment with Node.js 22.13.0";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
  flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = nixpkgs.legacyPackages.${system};

      # Custom Node.js 22.13.0 derivation
      nodeInfo = {
        "x86_64-linux" = {
          url = "https://nodejs.org/dist/v22.13.0/node-v22.13.0-linux-x64.tar.xz";
          sha256 = "1xk4f7jnyb0499lq8i9393lnpbbqqz2fpp0b7pbi6cy3cdqdbw1z";
        };
        "aarch64-linux" = {
          url = "https://nodejs.org/dist/v22.13.0/node-v22.13.0-linux-arm64.tar.xz";
          sha256 = "0avbighw7s9vvdls810gdgi36jg6jh0lszar4fxfc39xk094mrax";
        };
        "x86_64-darwin" = {
          url = "https://nodejs.org/dist/v22.13.0/node-v22.13.0-darwin-x64.tar.xz";
          sha256 = "1sqaqa55flgxkvgj9cwh2w4pzwa11ygsz06y67j8ns0yd6l3yv8q";
        };
        "aarch64-darwin" = {
          url = "https://nodejs.org/dist/v22.13.0/node-v22.13.0-darwin-arm64.tar.xz";
          sha256 = "1il3s50kfh70zm2ngcyyrsipd6jwl6njy01q9ycralm5yqz8kc3i";
        };
      };

      currentNodeInfo = nodeInfo.${system} or (throw "Unsupported system: ${system}");

      nodejs-22_13_0 = pkgs.stdenv.mkDerivation rec {
        pname = "nodejs";
        version = "22.13.0";

        src = pkgs.fetchurl {
          url = currentNodeInfo.url;
          sha256 = currentNodeInfo.sha256;
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
          nodejs-22_13_0
        ];

        nativeBuildInputs = with pkgs; [
          # Run your GitHub Actions locally!
          act

          # End-to-end testing
          cypress

          # Linting
          eslint

          # Package manager
          yarn
        ];

        shellHook = ''
          echo "Node.js $(node --version) environment loaded"
          echo "npm $(npm --version) available"
        '';
      };
    }
  );
}