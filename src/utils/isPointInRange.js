function isPointInRange(point, mapBounds) {
  const { NELat, NELng, SWLat, SWLng } = mapBounds;
  
  if (point) {
    if (
      point.lat >= SWLat &&
      point.lat <= NELat &&
      point.lng >= SWLng &&
      point.lng <= NELng
    ) {
      return true;
    }
    return false;
  }
}

module.exports = {
  isPointInRange,
};
