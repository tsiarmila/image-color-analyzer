document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadstart = function() {
        document.getElementById('spinner').style.display = 'block'; // Показываем спиннер при начале загрузки
    };

    reader.onload = function() {
        const img = new Image();
        img.onload = function() {
            // ... код анализа цветов ...
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const pixelData = imageData.data;

            const colorCount = {};
            for (let i = 0; i < pixelData.length; i += 4) {
                const r = pixelData[i];
                const g = pixelData[i + 1];
                const b = pixelData[i + 2];
                const color = `rgb(${r},${g},${b})`;

                if (colorCount[color]) {
                    colorCount[color]++;
                } else {
                    colorCount[color] = 1;
                }
            }

            const sortedColors = Object.keys(colorCount).sort((a, b) => colorCount[b] - colorCount[a]);

            const colors = sortedColors.slice(0, 5);

            document.documentElement.style.setProperty('--color1', colors[0]);
            document.documentElement.style.setProperty('--color2', colors[1]);
            document.documentElement.style.setProperty('--color3', colors[2]);
            document.documentElement.style.setProperty('--color4', colors[3]);
            document.documentElement.style.setProperty('--color5', colors[4]);

            const colorPalette = document.getElementById('colorPalette');
            colorPalette.innerHTML = ''; // Очистить предыдущие цвета

            sortedColors.slice(0, 5).forEach(color => {
                const box = document.createElement('div');
                box.className = 'box';
                const colorBox = document.createElement('div');
                colorBox.className = 'colorBox';
                colorBox.style.backgroundColor = color;
                box.appendChild(colorBox);

                const hexSpan = document.createElement('span');
                hexSpan.className = 'hexSpan';
                hexSpan.innerText = rgbToHex(color); // Установка HEX-кода
                box.appendChild(hexSpan);

                // Создаем кнопку для копирования
                const copyButton = document.createElement('button');
                copyButton.innerHTML = '&#128203;'; // Это Unicode-символ для копирования или '📃'
                copyButton.title = 'Copy';
                copyButton.addEventListener('click', function() {
                copyToClipboard(rgbToHex(color));
                });
                box.appendChild(copyButton);


                colorPalette.appendChild(box);
            });

            // Скрыть спиннер после завершения анализа
            document.getElementById('spinner').style.display = 'none';
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});

// Функция для конвертации RGB в HEX
function rgbToHex(rgb) {
    // Разделяем строку rgb() на числа
    const [r, g, b] = rgb.substring(4, rgb.length - 1).split(',').map(Number);
    // Форматируем числа в HEX и возвращаем строку
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function copyToClipboard(text) {
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert('Color copied to clipboard: ' + text);
}
