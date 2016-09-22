"use strict";

var gulp = require("gulp"),  // Подключаем Gulp
    sass = require("gulp-sass"),  // Подключаем Sass-пакет
    plumber = require("gulp-plumber"), //Подключаем Пламбер
    postcss = require("gulp-postcss"), //Подключаем postcss
    autoprefixer = require("autoprefixer"),  //Подключаем автопрефиксы
    gutil = require("gulp-util"), //Сжимаем JS-файлы
    minify = require("gulp-csso"), //Подключаем плагин для сжатия css
    rename = require("gulp-rename"), //Подключаем плагин для переименования
    imagemin = require("gulp-imagemin"), //Подключаем плагин для сжатия картинок
    svgmin = require("gulp-svgmin"), //Подключаем плагин для сжатия svg
    svgstore = require("gulp-svgstore"), //Подключаем для создания svg-спрайта
    concat = require("gulp-concat"), // для склеивания файлов
    uglify = require("gulp-uglifyjs"), //для сжатия всех скриптов
    mqpacker = require("css-mqpacker"),
    run = require("run-sequence"), //Плагин для последовательной работы тасков
    del = require("del"), //Плагин для удаления файлов
    server = require("browser-sync"); //Подключаем браузер-синк(слежение в браузере)

gulp.task("style", function() { //Создаём таск "style"

  gulp.src("app/sass/style.scss")   //Берём файл sass для обработки
    .pipe(plumber()) //Запрещаем ошибкам прерывать скрипт
    .pipe(sass({errLogToConsole: true}))   //Преобразуем Sass в CSS
    .pipe(postcss([  //Добавляем префиксы под разные версии
      autoprefixer({browsers: [
        // "last 2 version",
        // "last 2 Chrome versions",
        // "last 2 Firefox versions",
        // "last 2 Opera versions",
        // "last 2 Edge versions"
        "last 3 version"
      ]}),
      mqpacker({
        sort: true //соеденяем все медиазапросы
      })
    ]))
    // .pipe(gulp.dest("app/css"))  //Выгружаем результаты в папку app/css
    .pipe(gulp.dest("build/css"))  //Выгружаем результаты в папку build/css
    .pipe(minify())  //Делаем минификацию кода
    .pipe(rename("style.min.css")) //переименовываем файл style в style.min
    .pipe(gulp.dest("build/css")) //выгружаем в build/css
    .pipe(server.reload({stream: true})); //После сборки делаем перезагрузку страницы

  gulp.src("app/sass/libs.scss")
    .pipe(plumber()) //Запрещаем ошибкам прерывать скрипт
    .pipe(sass({errLogToConsole: true}))   //Преобразуем Sass в CSS
    // .pipe(gulp.dest("app/css"))  //Выгружаем результаты в папку app/css
    .pipe(gulp.dest("build/css"))  //Выгружаем результаты в папку build/css
    .pipe(server.reload({stream: true})); //После сборки делаем перезагрузку страницы
});

gulp.task("htmlChange", function () {
  return gulp.src([
    "app/*.html"
  ], {
    base: "app"
  })
    .pipe(gulp.dest("build"))
    .pipe(server.reload({stream: true}));
});
gulp.task("JsChange", function () {
  return gulp.src([
    "app/js/**/*.js"
  ], {
    base: "app"
  })
    .pipe(gulp.dest("build"))
    .pipe(server.reload({stream: true}));
});

gulp.task("serve",  function() {
  server.init({
    server: "build",
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch("app/sass/**/*.{scss,sass}", ["style"]);  //Наблюдение за scss файлами в папке scss
  gulp.watch("app/js/*.js", ["JsChange"]);  //Наблюдение за js файлами в папке проекта
  gulp.watch("app/*.html", ["htmlChange"]); //Наблюдение за html файлами в папке проекта
  gulp.watch("build/**/*").on("change", server.reload);
});
// ====================================================
// ====================================================
// ================= Сборка проекта BUILD =============
// Чистка папки
gulp.task("clean", function () {
  return del("build");
});
// Копируем файлы из App в папку build
gulp.task("copy", function () {
  return gulp.src([
    "app/fonts/**/*.{woff,woff2}",
    "app/img/**/*",
    "app/js/**",
    "app/*.html"
  ], {
    base: "app"
  })
    .pipe(gulp.dest("build"));
});
// Оптимизация картинок
gulp.task("images", function () {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});
// Оптимизируем svg картинки и собираем спрайт
gulp.task("svg-symbols", function() {
  return gulp.src("build/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("svg-symbols.svg"))
    .pipe(gulp.dest("build/img"));
});
// Остальные файлы, такие как favicon.ico и пр.
gulp.task("extras", function () {
  return gulp.src([
    "app/*.*",
    "!app/*.html"
  ])
  .pipe(gulp.dest("build"));
});
// Оптимизируем js-common
gulp.task("js-common", function() {
  return gulp.src("app/js/common.js") //берём файл common.js в app/js
  .pipe(gulp.dest("build/js"))
  .pipe(uglify())  //cжимаем common.js
  .pipe(rename("common.min.js")) //переименовываем файл common.js в common.min.js
  .pipe(gulp.dest("build/js"))  //Выгружаем результаты в папку build/css
});
// Оптимизируем js-библиотеки
gulp.task("js-libs", function() {
  return gulp.src("bower_modules/**/*.js") //берём все файлы .js в bower_modules
  .pipe(concat("libs.min.js"))
  .pipe(uglify())  //cжимаем libs.min.js
  .pipe(gulp.dest("build/js")); //выгружаем в build/js
});
//Оптимизируем css-библиотеки
gulp.task("css-libs", function() {
  return gulp.src("build/css/libs.css") //берём файл в build/css
  .pipe(minify()) //минифицируем libs.css
  .pipe(rename("libs.min.css")) //переименовываем файл style в libs.min.css
  .pipe(gulp.dest("build/css")) //выгружаем в build/css
});
// Собираем папку BUILD
gulp.task("build", function (fn) {
  run(
    "clean",
    "copy",
    "style",
    // "images",
    "svg-symbols",
    "js-common",
    "js-libs",
    "css-libs",
    "extras",
    fn
  );
});
// ====================================================
// ====================================================
// ===================== Функции ======================

// Более наглядный вывод ошибок
var log = function (error) {
  console.log([
    '',
    "----------ERROR MESSAGE START----------",
    ("[" + error.name + " in " + error.plugin + "]"),
    error.message,
    "----------ERROR MESSAGE END----------",
    ''
  ].join('\n'));
  this.end();
}

gulp.task("server", function () {
  server({
    port: 3000,
    server: {
      baseDir: "app"
    }
  });
});

gulp.task("watch", function(){
  gulp.watch ([
    "app/*.*"
  ]).on("change", server.reload);
});

gulp.task("default", ["server", "watch"]);
