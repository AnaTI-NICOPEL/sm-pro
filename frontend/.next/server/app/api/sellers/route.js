"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/sellers/route";
exports.ids = ["app/api/sellers/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "pg":
/*!*********************!*\
  !*** external "pg" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("pg");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsellers%2Froute&page=%2Fapi%2Fsellers%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsellers%2Froute.js&appDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsellers%2Froute&page=%2Fapi%2Fsellers%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsellers%2Froute.js&appDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_DOWNLOADS_sistema_envio_msg_render_corrigido_sistema_envio_msg_render_fixed_sistema_envio_msg_render_fixed_frontend_app_api_sellers_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/sellers/route.js */ \"(rsc)/./app/api/sellers/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/sellers/route\",\n        pathname: \"/api/sellers\",\n        filename: \"route\",\n        bundlePath: \"app/api/sellers/route\"\n    },\n    resolvedPagePath: \"D:\\\\DOWNLOADS\\\\sistema_envio_msg_render_corrigido\\\\sistema_envio_msg_render_fixed\\\\sistema_envio_msg_render_fixed\\\\frontend\\\\app\\\\api\\\\sellers\\\\route.js\",\n    nextConfigOutput,\n    userland: D_DOWNLOADS_sistema_envio_msg_render_corrigido_sistema_envio_msg_render_fixed_sistema_envio_msg_render_fixed_frontend_app_api_sellers_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/sellers/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzZWxsZXJzJTJGcm91dGUmcGFnZT0lMkZhcGklMkZzZWxsZXJzJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGc2VsbGVycyUyRnJvdXRlLmpzJmFwcERpcj1EJTNBJTVDRE9XTkxPQURTJTVDc2lzdGVtYV9lbnZpb19tc2dfcmVuZGVyX2NvcnJpZ2lkbyU1Q3Npc3RlbWFfZW52aW9fbXNnX3JlbmRlcl9maXhlZCU1Q3Npc3RlbWFfZW52aW9fbXNnX3JlbmRlcl9maXhlZCU1Q2Zyb250ZW5kJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1EJTNBJTVDRE9XTkxPQURTJTVDc2lzdGVtYV9lbnZpb19tc2dfcmVuZGVyX2NvcnJpZ2lkbyU1Q3Npc3RlbWFfZW52aW9fbXNnX3JlbmRlcl9maXhlZCU1Q3Npc3RlbWFfZW52aW9fbXNnX3JlbmRlcl9maXhlZCU1Q2Zyb250ZW5kJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUN3RztBQUNyTDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL3Npc3RlbWEtbXNnLz83YmU3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXERPV05MT0FEU1xcXFxzaXN0ZW1hX2VudmlvX21zZ19yZW5kZXJfY29ycmlnaWRvXFxcXHNpc3RlbWFfZW52aW9fbXNnX3JlbmRlcl9maXhlZFxcXFxzaXN0ZW1hX2VudmlvX21zZ19yZW5kZXJfZml4ZWRcXFxcZnJvbnRlbmRcXFxcYXBwXFxcXGFwaVxcXFxzZWxsZXJzXFxcXHJvdXRlLmpzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9zZWxsZXJzL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvc2VsbGVyc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvc2VsbGVycy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkQ6XFxcXERPV05MT0FEU1xcXFxzaXN0ZW1hX2VudmlvX21zZ19yZW5kZXJfY29ycmlnaWRvXFxcXHNpc3RlbWFfZW52aW9fbXNnX3JlbmRlcl9maXhlZFxcXFxzaXN0ZW1hX2VudmlvX21zZ19yZW5kZXJfZml4ZWRcXFxcZnJvbnRlbmRcXFxcYXBwXFxcXGFwaVxcXFxzZWxsZXJzXFxcXHJvdXRlLmpzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9zZWxsZXJzL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsellers%2Froute&page=%2Fapi%2Fsellers%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsellers%2Froute.js&appDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/sellers/route.js":
/*!**********************************!*\
  !*** ./app/api/sellers/route.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../lib/db */ \"(rsc)/./lib/db.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_lib_db__WEBPACK_IMPORTED_MODULE_1__);\n\n\nasync function GET() {\n    try {\n        const result = await _lib_db__WEBPACK_IMPORTED_MODULE_1__.pgPool.query(\"SELECT id, name, attendant_id, photo_base64 FROM sellers ORDER BY name ASC\");\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(result.rows);\n    } catch (error) {\n        console.error(\"Error fetching sellers:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Internal Server Error\"\n        }, {\n            status: 500\n        });\n    }\n}\nasync function POST(request) {\n    try {\n        const body = await request.json();\n        const { name, attendant_id, department_id, photo_base64 } = body;\n        if (!name || !attendant_id || !department_id) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Missing required fields\"\n            }, {\n                status: 400\n            });\n        }\n        const result = await _lib_db__WEBPACK_IMPORTED_MODULE_1__.pgPool.query(\"INSERT INTO sellers (name, attendant_id, department_id, photo_base64) VALUES ($1, $2, $3, $4) RETURNING *\", [\n            name,\n            attendant_id,\n            department_id,\n            photo_base64 || null\n        ]);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(result.rows[0], {\n            status: 201\n        });\n    } catch (error) {\n        if (error.code === \"23505\") {\n            // 23505 = unique_violation\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Este ID de Atendente j\\xe1 est\\xe1 cadastrado.\"\n            }, {\n                status: 400\n            });\n        }\n        console.error(\"Error creating seller:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Internal Server Error\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3NlbGxlcnMvcm91dGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBMkM7QUFDRjtBQUVsQyxlQUFlRTtJQUNsQixJQUFJO1FBQ0EsTUFBTUMsU0FBUyxNQUFNRiwyQ0FBTUEsQ0FBQ0csS0FBSyxDQUFDO1FBQ2xDLE9BQU9KLHFEQUFZQSxDQUFDSyxJQUFJLENBQUNGLE9BQU9HLElBQUk7SUFDeEMsRUFBRSxPQUFPQyxPQUFPO1FBQ1pDLFFBQVFELEtBQUssQ0FBQywyQkFBMkJBO1FBQ3pDLE9BQU9QLHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7WUFBRUUsT0FBTztRQUF3QixHQUFHO1lBQUVFLFFBQVE7UUFBSTtJQUMvRTtBQUNKO0FBRU8sZUFBZUMsS0FBS0MsT0FBTztJQUM5QixJQUFJO1FBQ0EsTUFBTUMsT0FBTyxNQUFNRCxRQUFRTixJQUFJO1FBQy9CLE1BQU0sRUFBRVEsSUFBSSxFQUFFQyxZQUFZLEVBQUVDLGFBQWEsRUFBRUMsWUFBWSxFQUFFLEdBQUdKO1FBRTVELElBQUksQ0FBQ0MsUUFBUSxDQUFDQyxnQkFBZ0IsQ0FBQ0MsZUFBZTtZQUMxQyxPQUFPZixxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO2dCQUFFRSxPQUFPO1lBQTBCLEdBQUc7Z0JBQUVFLFFBQVE7WUFBSTtRQUNqRjtRQUVBLE1BQU1OLFNBQVMsTUFBTUYsMkNBQU1BLENBQUNHLEtBQUssQ0FDN0IsNkdBQ0E7WUFBQ1M7WUFBTUM7WUFBY0M7WUFBZUMsZ0JBQWdCO1NBQUs7UUFHN0QsT0FBT2hCLHFEQUFZQSxDQUFDSyxJQUFJLENBQUNGLE9BQU9HLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFBRUcsUUFBUTtRQUFJO0lBQzNELEVBQUUsT0FBT0YsT0FBTztRQUNaLElBQUlBLE1BQU1VLElBQUksS0FBSyxTQUFTO1lBQ3hCLDJCQUEyQjtZQUMzQixPQUFPakIscURBQVlBLENBQUNLLElBQUksQ0FBQztnQkFBRUUsT0FBTztZQUEyQyxHQUFHO2dCQUFFRSxRQUFRO1lBQUk7UUFDbEc7UUFDQUQsUUFBUUQsS0FBSyxDQUFDLDBCQUEwQkE7UUFDeEMsT0FBT1AscURBQVlBLENBQUNLLElBQUksQ0FBQztZQUFFRSxPQUFPO1FBQXdCLEdBQUc7WUFBRUUsUUFBUTtRQUFJO0lBQy9FO0FBQ0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zaXN0ZW1hLW1zZy8uL2FwcC9hcGkvc2VsbGVycy9yb3V0ZS5qcz9mZDg3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcbmltcG9ydCB7IHBnUG9vbCB9IGZyb20gJy4uLy4uLy4uL2xpYi9kYic7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGdQb29sLnF1ZXJ5KCdTRUxFQ1QgaWQsIG5hbWUsIGF0dGVuZGFudF9pZCwgcGhvdG9fYmFzZTY0IEZST00gc2VsbGVycyBPUkRFUiBCWSBuYW1lIEFTQycpO1xuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24ocmVzdWx0LnJvd3MpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIHNlbGxlcnM6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIFNlcnZlciBFcnJvcicgfSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3QpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKCk7XG4gICAgICAgIGNvbnN0IHsgbmFtZSwgYXR0ZW5kYW50X2lkLCBkZXBhcnRtZW50X2lkLCBwaG90b19iYXNlNjQgfSA9IGJvZHk7XG5cbiAgICAgICAgaWYgKCFuYW1lIHx8ICFhdHRlbmRhbnRfaWQgfHwgIWRlcGFydG1lbnRfaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTWlzc2luZyByZXF1aXJlZCBmaWVsZHMnIH0sIHsgc3RhdHVzOiA0MDAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwZ1Bvb2wucXVlcnkoXG4gICAgICAgICAgICAnSU5TRVJUIElOVE8gc2VsbGVycyAobmFtZSwgYXR0ZW5kYW50X2lkLCBkZXBhcnRtZW50X2lkLCBwaG90b19iYXNlNjQpIFZBTFVFUyAoJDEsICQyLCAkMywgJDQpIFJFVFVSTklORyAqJyxcbiAgICAgICAgICAgIFtuYW1lLCBhdHRlbmRhbnRfaWQsIGRlcGFydG1lbnRfaWQsIHBob3RvX2Jhc2U2NCB8fCBudWxsXVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihyZXN1bHQucm93c1swXSwgeyBzdGF0dXM6IDIwMSB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJzIzNTA1Jykge1xuICAgICAgICAgICAgLy8gMjM1MDUgPSB1bmlxdWVfdmlvbGF0aW9uXG4gICAgICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0VzdGUgSUQgZGUgQXRlbmRlbnRlIGrDoSBlc3TDoSBjYWRhc3RyYWRvLicgfSwgeyBzdGF0dXM6IDQwMCB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBzZWxsZXI6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIFNlcnZlciBFcnJvcicgfSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgICB9XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwicGdQb29sIiwiR0VUIiwicmVzdWx0IiwicXVlcnkiLCJqc29uIiwicm93cyIsImVycm9yIiwiY29uc29sZSIsInN0YXR1cyIsIlBPU1QiLCJyZXF1ZXN0IiwiYm9keSIsIm5hbWUiLCJhdHRlbmRhbnRfaWQiLCJkZXBhcnRtZW50X2lkIiwicGhvdG9fYmFzZTY0IiwiY29kZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/sellers/route.js\n");

/***/ }),

/***/ "(rsc)/./lib/db.js":
/*!*******************!*\
  !*** ./lib/db.js ***!
  \*******************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nconst { Pool } = __webpack_require__(/*! pg */ \"pg\");\nif (!process.env.DATABASE_URL) {\n    (__webpack_require__(/*! dotenv */ \"(rsc)/./node_modules/dotenv/lib/main.js\").config)({\n        path: \".env.local\"\n    });\n    (__webpack_require__(/*! dotenv */ \"(rsc)/./node_modules/dotenv/lib/main.js\").config)(); // fallback\n}\nlet pgPool;\nif (process.env.DATABASE_URL) {\n    pgPool = new Pool({\n        connectionString: process.env.DATABASE_URL\n    });\n} else {\n    console.warn(\"DATABASE_URL not found in environment\");\n}\nmodule.exports = {\n    pgPool\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGIuanMiLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU0sRUFBRUEsSUFBSSxFQUFFLEdBQUdDLG1CQUFPQSxDQUFDO0FBRXpCLElBQUksQ0FBQ0MsUUFBUUMsR0FBRyxDQUFDQyxZQUFZLEVBQUU7SUFDM0JILHFGQUF3QixDQUFDO1FBQUVLLE1BQU07SUFBYTtJQUM5Q0wscUZBQXdCLElBQUksV0FBVztBQUMzQztBQUVBLElBQUlNO0FBRUosSUFBSUwsUUFBUUMsR0FBRyxDQUFDQyxZQUFZLEVBQUU7SUFDMUJHLFNBQVMsSUFBSVAsS0FBSztRQUNkUSxrQkFBa0JOLFFBQVFDLEdBQUcsQ0FBQ0MsWUFBWTtJQUM5QztBQUNKLE9BQU87SUFDSEssUUFBUUMsSUFBSSxDQUFDO0FBQ2pCO0FBRUFDLE9BQU9DLE9BQU8sR0FBRztJQUFFTDtBQUFPIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc2lzdGVtYS1tc2cvLi9saWIvZGIuanM/M2RjOSJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IFBvb2wgfSA9IHJlcXVpcmUoJ3BnJyk7XG5cbmlmICghcHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMKSB7XG4gICAgcmVxdWlyZSgnZG90ZW52JykuY29uZmlnKHsgcGF0aDogJy5lbnYubG9jYWwnIH0pO1xuICAgIHJlcXVpcmUoJ2RvdGVudicpLmNvbmZpZygpOyAvLyBmYWxsYmFja1xufVxuXG5sZXQgcGdQb29sO1xuXG5pZiAocHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMKSB7XG4gICAgcGdQb29sID0gbmV3IFBvb2woe1xuICAgICAgICBjb25uZWN0aW9uU3RyaW5nOiBwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwsXG4gICAgfSk7XG59IGVsc2Uge1xuICAgIGNvbnNvbGUud2FybignREFUQUJBU0VfVVJMIG5vdCBmb3VuZCBpbiBlbnZpcm9ubWVudCcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgcGdQb29sIH07XG4iXSwibmFtZXMiOlsiUG9vbCIsInJlcXVpcmUiLCJwcm9jZXNzIiwiZW52IiwiREFUQUJBU0VfVVJMIiwiY29uZmlnIiwicGF0aCIsInBnUG9vbCIsImNvbm5lY3Rpb25TdHJpbmciLCJjb25zb2xlIiwid2FybiIsIm1vZHVsZSIsImV4cG9ydHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/db.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/dotenv"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsellers%2Froute&page=%2Fapi%2Fsellers%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsellers%2Froute.js&appDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDOWNLOADS%5Csistema_envio_msg_render_corrigido%5Csistema_envio_msg_render_fixed%5Csistema_envio_msg_render_fixed%5Cfrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();