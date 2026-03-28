import asyncio
import sys
from app.main import app
from app.db.session import AsyncSessionLocal
from app.crud.products import update_product
from app.schemas.product import ProductUpdate, ProductResponse

async def main():
    with open("out.txt", "w") as f:
        async with AsyncSessionLocal() as db:
            try:
                f.write('Testing update_product\n')
                data = ProductUpdate(name='Test Update')
                p = await update_product(db, 18, data)
                if p:
                    f.write('Product fetched successfully\n')
                    resp = ProductResponse.model_validate(p)
                    f.write(f'Success: {resp.id}\n')
                else:
                    f.write('Product not found\n')
            except Exception as e:
                import traceback
                traceback.print_exc(file=f)

asyncio.run(main())
