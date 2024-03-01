import React, { useState } from 'react';
import { getCenter } from 'geolib';
// import _ from 'lodash';
// import { indexOf } from 'lodash';
// import LeafletMap from './components/map';

//загрузка тогоже файла
//loader
//проверка на наличие данных в инпуте
//отправка данных

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [isFileLoaded, setFileLoaded] = useState(false);
  const [loadedFileName, setLoadedFileName] = useState('');
  const [isFileChecked, setFileChecked] = useState(false);
  const [checkedFileName, setCheckedFileName] = useState('');
  const [convertedData, setConvertedData] = useState('');

  let initialFormData = [];
  let processedArr = [];

  //отслеживание изменения textarea
  const handleChange = (e) => setInputValue(e.target.value);

  //загрузка файла
  const fileLoader = (event) => {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = function (event) {
      let currentTextareaValue = event.target.result;
      setInputValue('');
      setInputValue(currentTextareaValue);
      // console.log('содержание файла', currentTextareaValue);
    };

    console.log('загружаю файл', file.name);
    setLoadedFileName(file.name);
    reader.readAsText(file);
    setFileLoaded(true);
  };

  //очистка содержимого
  const inputClear = () => {
    setInputValue('');
    setConvertedData('');
    setFileLoaded(false);
    setFileChecked(false);
    console.log('данные очищены');
  };

  //проверка файла
  const firstDataChecker = () => {
    initialFormData = inputValue.trim().split(`\n`);
    console.log('проверяю файл...');
    initialFormData.forEach((elem) => {
      if (elem.split(`,`)[0][0] === '0') {
        let currentString =
          elem.split(`,`)[0] +
          ',' +
          elem.split(`,`)[18] +
          ',' +
          elem.split(`,`)[19] +
          ',' +
          elem.split(`,`)[20] +
          ',' +
          elem.split(`,`)[21];
        processedArr.push(currentString);
      }
    });

    //сохраняю шапку документа
    let dataArrHeader = processedArr[0];

    //отрезаю щапку - получаю массив для дальнейшей работы
    let slicedProcessedArr = processedArr.slice(1);

    //получаю длину рабочего массива
    let processedArrLength = slicedProcessedArr.length;

    //массив для индексов элементов с одинаковым UTC time
    //кадры
    let frameNumberToInterpolateArr = [[slicedProcessedArr[0].split(',')[0]]];
    //индексы
    let frameIndexToInterpolateArr = [[0]];
    let currentFrameArr = [];
    let currentIndexArr = [];

    //запускаю цикл по массиву без шапки
    for (let i = 1; i < processedArrLength; i++) {
      //текущий массив одинаковых кадров

      let currentElemUTCTime = processedArr[i].split(',')[4];
      let prevoisElemUTCTime = processedArr[i - 1].split(',')[4];
      let currentFrameNumber = processedArr[i].split(',')[0];

      currentFrameArr.push(currentFrameNumber);
      currentIndexArr.push(i);

      // console.log(currentElemUTCTime, prevoisElemUTCTime);

      if (currentElemUTCTime === prevoisElemUTCTime) {
        // console.log(currentFrameNumber);
        currentFrameArr.push(currentFrameNumber);
        currentIndexArr.push(i);
        // console.log(currentFrameArr);
        // console.log(currentIndexArr);
      } else {
        frameNumberToInterpolateArr.push(currentFrameArr);
        frameIndexToInterpolateArr.push(currentIndexArr);
        currentFrameArr = [];
        currentIndexArr = [];
      }
    }

    console.log('кадры для интерполяции', frameNumberToInterpolateArr);
    console.log('индексы для интерполяции', frameIndexToInterpolateArr);

    //интерполирую координаты повторяющихся кадров в рабочем массиве
    frameIndexToInterpolateArr.forEach((elem) => {
      // console.log(slicedProcessedArr[elem]);

      let updatedCoords = getCenter([
        {
          latitude: slicedProcessedArr[elem - 1].split(',')[1],
          longitude: slicedProcessedArr[elem - 1].split(',')[2],
        },
        {
          latitude: slicedProcessedArr[elem + 1].split(',')[1],
          longitude: slicedProcessedArr[elem + 1].split(',')[2],
        },
      ]);

      let updatedPointHeight =
        (Number(slicedProcessedArr[elem - 1].split(',')[3]) +
          Number(slicedProcessedArr[elem + 1].split(',')[3])) /
        2;
      slicedProcessedArr[elem] =
        slicedProcessedArr[elem].split(',')[0] +
        ', ' +
        updatedCoords.latitude.toFixed(8) +
        ', ' +
        updatedCoords.longitude.toFixed(8) +
        ', ' +
        updatedPointHeight.toFixed(3) +
        ',' +
        slicedProcessedArr[elem].split(',')[4];
    });

    // console.log('updatedSlicedArr', slicedProcessedArr);
    setFileChecked(true);
    setConvertedData(slicedProcessedArr);
  };

  //функция сохранения файла
  function writeFile(name, value) {
    let val = value;
    if (value === undefined) {
      val = '';
    }
    const download = document.createElement('a');
    download.href =
      'data:text/plain;content-disposition=attachment;filename=file,' + val;
    download.download = name;
    download.style.display = 'none';
    download.id = 'download';
    document.body.appendChild(download);
    document.getElementById('download').click();
    document.body.removeChild(download);
  }

  //скачать файл
  const downloadData = () => {
    console.log('скачиваю файл');
    let downloadedData = '';
    convertedData.forEach((elem) => {
      let currentString = elem + '\n';
      downloadedData += currentString;
    });

    let updStr = downloadedData.replaceAll(',', '');
    console.log(updStr);

    writeFile(prompt('введите имя файла'), updStr);
    console.log('файл скачан');
  };

  return (
    <>
      <div className='marginedContainer'>
        <h1 className='m-2 border-bottom text-center'>
          Конвертер траектории с LadyBug
        </h1>
      </div>
      <form action='' id='form'>
        <div className='inputContainer p-2'>
          <textarea
            className='form-control'
            id='inputText'
            name='inputText'
            placeholder='>>вставь данные сюда или выбери текстовый файл<<'
            rows='10'
            value={inputValue}
            onChange={handleChange}
          ></textarea>

          <div className=' buttonContainer p-2'>
            <div className='spanContainer'>
              <label className='input-file'>
                <input
                  type='file'
                  className='form-control'
                  id='inputGroupFile04'
                  aria-describedby='inputGroupFileAddon04'
                  onChange={fileLoader}
                  aria-label='Upload'
                />
                <span id='spanButton' className='bg-primary'>
                  выбрать файл
                </span>
              </label>
            </div>

            {isFileLoaded && (
              <div className='font-weight-bold'>загружен {loadedFileName}</div>
            )}

            <button
              className='btn btn-primary m-2 border-secondary'
              id='func-buttons'
              type='button'
              onClick={firstDataChecker}
            >
              проверить данные
            </button>

            {isFileChecked && (
              <div className='font-weight-bold'>
                {checkedFileName} файл проверен
              </div>
            )}

            <button
              className='btn btn-success m-2 border-secondary'
              id='func-buttons'
              type='button'
              onClick={downloadData}
            >
              скачать готовый трэк
            </button>

            <button
              className='btn btn-info m-2 border-secondary'
              type='button'
              id='func-buttons'
              onClick={inputClear}
            >
              очистить данные
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default App;

// функция для создания массива с повторяющимися кадрами
// //запускаю цикл по массиву без шапки
//     for (let i = 1; i < processedArrLength; i++) {
//       let currentFrameArr = [];
//       // if (i > 1) {
//         let currentElemUTCTime = processedArr[i].split(',')[4];
//         let prevoisElemUTCTime = processedArr[i - 1].split(',')[4];
//         // let currentFrameNumber = processedArr[i].split(',')[0];
//         // let prevoisFrameNumber = processedArr[i-1].split(',')[0];

//         // console.log(currentElemUTCTime, prevoisElemUTCTime);

//         if (currentElemUTCTime === prevoisElemUTCTime) {
//           console.log(currentElemUTCTime, prevoisElemUTCTime);
//         }

//         if (currentElemUTCTime === prevoisElemUTCTime) {
//           //создаю массив номеров кадров, которые необходимо интерполировать
//           frameNumberToInterpolateArr.push(
//             // processedArr[i - 1].split(',')[0],
//             processedArr[i].split(',')[0]
//           );
//           //создаю массив индексов кадров для интерполяции
//           frameIndexToInterpolateArr.push(i - 1);
//         // }
//       }
//     }
