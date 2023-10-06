"""Initial migration.

Revision ID: 64d9f7fb1e84
Revises: 
Create Date: 2023-09-29 10:50:38.967474

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '64d9f7fb1e84'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('customer',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('customer_name', sa.String(length=70), nullable=False),
    sa.Column('customer_address', sa.String(length=100), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('unit',
    sa.Column('unit_code', sa.String(length=10), nullable=False),
    sa.Column('unit_name', sa.String(length=15), nullable=False),
    sa.PrimaryKeyConstraint('unit_code')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('unit')
    op.drop_table('customer')
    # ### end Alembic commands ###
