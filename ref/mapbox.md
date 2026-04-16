1. Thiết lập Mapbox GL JS
Đầu tiên, thêm thư viện Mapbox GL JS vào dự án của bạn (qua CDN hoặc npm).
Dùng CDN – thêm vào <head> của file HTML: [CDN guide]
https://docs.mapbox.com/mapbox-gl-js/guides/get-started/use-with-cdn/
<link href="https://api.mapbox.com/mapbox-gl-js/v3.20.0/mapbox-gl.css" rel="stylesheet">
<script src="https://api.mapbox.com/mapbox-gl-js/v3.20.0/mapbox-gl.js"></script>
________________________________________
2. Khởi tạo bản đồ
Tạo một div làm container và khởi tạo bản đồ, căn giữa vào Việt Nam: [CDN guide]
https://docs.mapbox.com/mapbox-gl-js/guides/get-started/use-with-cdn/
<div id="map" style="width: 100%; height: 600px;"></div>

<script>
  mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [106.6297, 10.8231], // TP. Hồ Chí Minh
    zoom: 6
  });
</script>
________________________________________
3. Hiển thị dữ liệu bất động sản lên bản đồ
Bạn có hai cách chính để hiển thị dữ liệu: [choosing approach]
https://docs.mapbox.com/mapbox-gl-js/guides/add-your-data/#choosing-the-right-approach
Cách 1: Markers (phù hợp cho ít điểm, < 100)
Dùng mapboxgl.Marker để đánh dấu từng vị trí bất động sản. Có thể tùy chỉnh màu sắc theo giá: [Markers guide]
https://docs.mapbox.com/mapbox-gl-js/guides/add-your-data/markers/
const marker = new mapboxgl.Marker({ color: '#FF0000' })
  .setLngLat([106.6297, 10.8231])
  .addTo(map);
Cách 2: Style Layers (phù hợp cho nhiều điểm, dữ liệu lớn)
Dùng GeoJSON source + layer để hiển thị hàng nghìn điểm với hiệu suất cao. Ví dụ dùng circle layer: [style layers]
https://docs.mapbox.com/mapbox-gl-js/guides/add-your-data/style-layers/#add-layers-that-use-your-data-sources
map.addSource('real-estate', {
  type: 'geojson',
  data: 'your-properties.geojson' // dữ liệu bất động sản của bạn
});

map.addLayer({
  'id': 'properties-layer',
  'type': 'circle',
  'source': 'real-estate',
  'paint': {
    'circle-radius': 6,
    'circle-color': '#007cbf'
  }
});
________________________________________
4. Phân vùng theo giá (Choropleth Map)
Để hiển thị giá bất động sản theo vùng (tỉnh/thành phố), bạn có thể kết hợp dữ liệu JSON của mình với geometries từ vector tileset bằng biểu thức match, tạo ra bản đồ choropleth tô màu theo giá. [data join example]
https://docs.mapbox.com/mapbox-gl-js/example/data-join/
________________________________________
5. Thêm tương tác (click/hover)
Cho phép người dùng click vào điểm để xem thông tin chi tiết: [style layers]
https://docs.mapbox.com/mapbox-gl-js/guides/add-your-data/style-layers/#add-layers-that-use-your-data-sources
map.addInteraction('click', {
  type: 'click',
  target: { layerId: 'properties-layer' },
  handler: ({ feature }) => {
    console.log('Thông tin BĐS:', feature.properties);
    // Hiển thị popup với giá, diện tích, v.v.
  }
});
________________________________________
Tóm tắt các bước cần làm
| Bước | Việc cần làm | |------|-------------| | 1 | Tạo tài khoản Mapbox và lấy Access Token | | 2 | Cài đặt Mapbox GL JS (CDN hoặc npm) | | 3 | Khởi tạo bản đồ căn giữa Việt Nam | | 4 | Chuẩn bị dữ liệu BĐS dạng GeoJSON (tọa độ, giá, vùng) | | 5 | Thêm dữ liệu lên bản đồ bằng Markers hoặc Style Layers | | 6 | Tô màu theo vùng/giá bằng data-driven styling | | 7 | Thêm tương tác click/hover để xem chi tiết |
