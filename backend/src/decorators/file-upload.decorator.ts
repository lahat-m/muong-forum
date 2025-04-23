import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";
import { extname, join } from "path";
import { diskStorage } from "multer";

export function UploadEventPoster(field = 'eventPoster') {
    return applyDecorators(
        UseInterceptors(
            FileInterceptor(field, {
                storage: diskStorage({
                    destination: join(process.cwd(), 'uploads'),
                    filename: (_, file, cb) => {
                        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                        cb(null, `${field}-${name}${extname(file.originalname)}`);
                    },
                }),
            }),
        ),
        ApiConsumes('multipart/form-data'),
    )
}