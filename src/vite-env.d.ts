/// <reference types="vite/client" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      x3d: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          width?: string;
          height?: string;
          showLog?: boolean;
          showStat?: boolean;
          showProgress?: boolean;
          backend?: string;
        },
        HTMLElement
      >;

      scene: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;

      viewpoint: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          position?: string;
          orientation?: string;
          centerOfRotation?: string;
          fieldOfView?: string;
          description?: string;
          bind?: boolean;
          jump?: boolean;
        },
        HTMLElement
      >;

      inline: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          url?: string;
          nameSpaceName?: string;
          mapDEFToID?: boolean;
          load?: boolean;
        },
        HTMLElement
      >;

      transform: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          translation?: string;
          rotation?: string;
          scale?: string;
          center?: string;
          scaleOrientation?: string;
        },
        HTMLElement
      >;
    }
  }
}

