// X3DOM Type Definitions
declare global {
  interface Window {
    x3dom: {
      reload: () => void;
      runtime: {
        enterFrame: () => void;
        exitFrame: () => void;
        canvas: {
          doc: Document;
        };
      };
    };
  }
}

export {};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
    x3d: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      width?: string;
      height?: string;
      showStat?: boolean;
      showLog?: boolean;
      showProgress?: string;
      useGeoCache?: boolean;
    };
    scene: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    viewpoint: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      position?: string;
      orientation?: string;
      centerOfRotation?: string;
      bind?: boolean;
      jump?: boolean;
      navigationType?: string;
      navigationMode?: string;
      fieldOfView?: string;
      description?: string;
      id?: string;
    };
    navigationinfo: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      type?: string;
      speed?: string;
      headlight?: boolean;
    };
    background: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      skyColor?: string;
      groundColor?: string;
      groundAngle?: string;
    };
    transform: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      translation?: string;
      rotation?: string;
      scale?: string;
      DEF?: string;
      center?: string;
      scaleOrientation?: string;
      id?: string;
    };
    shape: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    box: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      size?: string;
    };
    sphere: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      radius?: string;
    };
    material: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      diffuseColor?: string;
      emissiveColor?: string;
      specularColor?: string;
      shininess?: string;
      transparency?: string;
    };
    appearance: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    inline: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      url?: string;
      nameSpaceName?: string;
      mapDEFToID?: boolean;
    };
    directionalLight: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      direction?: string;
      color?: string;
      intensity?: string;
      on?: boolean;
    };
    pointLight: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      location?: string;
      color?: string;
      intensity?: string;
      on?: boolean;
    };
    }
  }
}