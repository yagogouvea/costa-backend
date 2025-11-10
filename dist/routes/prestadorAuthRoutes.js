"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prestadorAuthController_1 = require("../controllers/prestadorAuthController");
const router = (0, express_1.Router)();
router.post('/login', prestadorAuthController_1.prestadorLogin);
exports.default = router;
