{
  description = "Development environment with Node.js 22.14.0";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
  flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = nixpkgs.legacyPackages.${system};

      # Custom Node.js 22.14.0 derivation
      nodeInfo = {
        "x86_64-linux" = {
          url = "https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-x64.tar.xz";
          sha256 = "1v1p0kl4kcn55gdfy9rrzvman18hvd046fi7wk20bjwdbjx9vc39";
        };
        "aarch64-linux" = {
          url = "https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-arm64.tar.xz";
          sha256 = "0l00wfcxr6bxnmh2z8k79a3hbmr8r8y1gw390axqq3mdid9vzgq8";
        };
        "x86_64-darwin" = {
          url = "https://nodejs.org/dist/v22.14.0/node-v22.14.0-darwin-x64.tar.xz";
          sha256 = "00mzvj4069wlv449czbdahjkfv2fjv1ky74wshy80gszq88v5dfy";
        };
        "aarch64-darwin" = {
          url = "https://nodejs.org/dist/v22.14.0/node-v22.14.0-darwin-arm64.tar.xz";
          sha256 = "09rmqhzy5p54h96l0m86f948lnj03kiv4hr7664p52af3fvmr12f";
        };
      };

      currentNodeInfo = nodeInfo.${system} or (throw "Unsupported system: ${system}");

      nodejs-22_14_0 = pkgs.stdenv.mkDerivation rec {
        pname = "nodejs";
        version = "22.14.0";

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
          nodejs-22_14_0
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