import type { DefectClass, SignatureType } from '../../types';

export const signatureColor: Record<SignatureType, string> = {
  Scratch: '#E4572E',
  'Reticle Repeater': '#9B5DE5',
  'Edge Ring': '#E8A317',
  'Center Cluster': '#16A39A',
  Random: '#A3A7B5',
};

export const classColor: Record<DefectClass, string> = {
  Particle: '#3B82C8',
  Residue: '#E8A317',
  Pit: '#16A39A',
  Pattern: '#9B5DE5',
  Scratch: '#E4572E',
};

export const signatureLabel = (type: SignatureType) => (type === 'Random' ? 'No signature (random)' : type);
