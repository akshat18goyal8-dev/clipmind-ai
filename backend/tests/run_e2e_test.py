import asyncio
import os
import uuid
from app.core.database import AsyncSessionLocal, init_db
from app.models.user import User
from app.models.project import Project
from app.core.worker import PipelineWorker
from sqlalchemy import select
from sqlalchemy.orm import selectinload

async def run_verification():
    await init_db()
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.username == 'creator'))
        user = res.scalar_one_or_none()
        if not user:
            from app.core.security import get_password_hash
            user = User(
                email='creator@clipmind.ai',
                username='creator',
                hashed_password=get_password_hash('clipmind2026')
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        project_id = str(uuid.uuid4())
        sample_path = os.path.abspath('temp/test_sample.mp4')
        project = Project(
            id=project_id,
            user_id=user.id,
            title='E2E Live Verification Run',
            category='Gaming',
            status='processing',
            source_type='upload',
            video_file_path=sample_path
        )
        db.add(project)
        await db.commit()

    print(f'Starting pipeline for project {project_id}...')
    await PipelineWorker.run_pipeline(project_id)
    print('Pipeline execution finished. Verifying output...')

    async with AsyncSessionLocal() as db:
        res = await db.execute(
            select(Project)
            .where(Project.id == project_id)
            .options(selectinload(Project.clips))
        )
        p = res.scalar_one()
        print(f'Project Status: {p.status}')
        print(f'Project Progress: {p.progress}%')
        print(f'Current Stage: {p.current_stage}')
        print(f'Clips Generated: {len(p.clips)}')
        for c in p.clips:
            print(f'  - Clip "{c.title}": {c.duration}s | Viral Score: {c.viral_score}/100')
            print(f'    Raw MP4: {c.clip_file_path}')
            print(f'    9:16 Vertical: {c.processed_9_16_path}')
            print(f'    Thumbnail: {c.thumbnail_path}')

if __name__ == '__main__':
    asyncio.run(run_verification())
