import React from 'react';

// eslint-disable-next-line import/prefer-default-export
export const applyNumberCircle = (number) => (
  <div style={{
    color: '#ffffff',
    backgroundColor: '#006273',
    borderRadius: '50%',
    padding: '5px',
    minWidth: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '12px',
    width: '20px',
    height: '45px',
    marginTop: '7px',
  }}
  >
    {number}
  </div>
);

export const LOC_LEVELS = 4;
export const locationFormatter = (location) => (
  Array.from({ length: LOC_LEVELS }, (_, i) => {
    let loc = location;
    const levels = [];
    while (loc) {
      levels.unshift(loc.name); // top level first
      loc = loc.parent;
    }
    return levels[i] || '';
  })
);

/**
 * Walk up the location hierarchy from the leaf by `level` steps.
 * locationAtLevel(colline, 0) = colline.name
 * locationAtLevel(colline, 1) = commune.name
 * locationAtLevel(colline, 2) = province.name
 */
export const locationAtLevel = (lowestLevelLoc, level) => {
  let location = lowestLevelLoc;
  let levelDiff = level;
  while (levelDiff > 0 && location) {
    location = location.parent;
    levelDiff -= 1;
  }
  return location ? location.name : '';
};

/**
 * Read configurable location levels from the location.Location.MaxLevels ref.
 * Defaults to LOC_LEVELS (4) if the ref is not set.
 */
export const getLocLevels = (modulesManager) => {
  const ref = modulesManager.getRef('location.Location.MaxLevels');
  return ref ? parseInt(ref, 10) : LOC_LEVELS;
};
