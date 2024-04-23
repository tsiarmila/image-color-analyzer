document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadstart = function() {
        document.getElementById('spinner').style.display = 'block'; // Показываем спиннер при начале загрузки
    };

    reader.onload = function() {
        const img = new Image();
        img.onload = function() {
            // Отображаем уменьшенное изображение
            const previewImage = document.getElementById('resizedImageContainer');
            const MAX_WIDTH = 100; // Максимальная ширина уменьшенного изображения
            const MAX_HEIGHT = 100;

            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Отображаем уменьшенное изображение в элементе img
            previewImage.src = canvas.toDataURL('image/jpeg');
            previewImage.style.display = 'block';
            previewImage.className = 'previewImage';

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixelData = imageData.data;
            const pixelSize = 10;

            const colorCount = {};
            for (let y = 0; y < canvas.height; y += pixelSize) {
                for (let x = 0; x < canvas.width; x += pixelSize) {
                    // Получаем цвет текущего пикселя
                    const index = (y * canvas.width + x) * 4;
                    const r = pixelData[index];
                    const g = pixelData[index + 1];
                    const b = pixelData[index + 2];
                    const a = pixelData[index + 3];

                    // Пропускаем прозрачные пиксели
                    if (a === 0) {
                        continue;
                    }

                    // Исключаем пиксели с низкой насыщенностью (преобразуем RGB в HSV и проверяем насыщенность)
                    const saturation = calculateSaturation(r, g, b);
                    if (saturation < 0.2) { // Настройте этот порог по вашему усмотрению
                        continue;
                    }

                    // Рисуем "пиксель" с выбранным цветом
                    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
                    ctx.fillRect(x, y, pixelSize, pixelSize);

                    const color = `rgb(${r},${g},${b})`;

                    if (colorCount[color]) {
                        colorCount[color]++;
                    } else {
                        colorCount[color] = 1;
                    }
                }
            }
            const sortedColors = Object.keys(colorCount).sort((a, b) => colorCount[b] - colorCount[a]);

            console.log("sortedColors", sortedColors);
            const colors = sortedColors.slice(0, 5);

            document.documentElement.style.setProperty('--color1', colors[0]);
            document.documentElement.style.setProperty('--color2', colors[1]);
            document.documentElement.style.setProperty('--color3', colors[2]);
            document.documentElement.style.setProperty('--color4', colors[3]);
            document.documentElement.style.setProperty('--color5', colors[4]);

            const colorPalette = document.getElementById('colorPalette');
            colorPalette.innerHTML = ''; // Очистить предыдущие цвета

            colors.forEach(color => {
                const box = document.createElement('div');
                box.className = 'box';
                const colorBox = document.createElement('div');
                colorBox.className = 'colorBox';
                colorBox.style.backgroundColor = color;
                box.appendChild(colorBox);

                const infoContainer = document.createElement('div'); // Создаем контейнер для hexSpan и copyButton
                infoContainer.className = 'infoContainer';

                const hexSpan = document.createElement('span');
                hexSpan.className = 'hexSpan';
                hexSpan.innerText = rgbToHex(color); // Преобразуем RGB в HEX
                infoContainer.appendChild(hexSpan);

                // Создаем кнопку для копирования HEX-кода цвета
                const copyButton = document.createElement('button');
                copyButton.innerHTML = '&#128203;'; // Unicode символ для копирования или '📃'
                copyButton.title = 'Copy';
                copyButton.addEventListener('click', function() {
                    copyToClipboard(rgbToHex(color));
                });
                infoContainer.appendChild(copyButton);
                box.appendChild(infoContainer);

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

// Функция для вычисления насыщенности цвета в пространстве HSV
function calculateSaturation(red, green, blue) {
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;

    if (max === 0) {
        return 0;
    }

    return delta / max;
}
